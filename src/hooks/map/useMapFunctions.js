import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCenter, 
  setZoom,
  setUserLocation,
  setSelectedPlace,
  setSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  setDirections,
} from '../../store/slices/mapSlice';
import { addRecentSearch } from '../../store/slices/searchSlice';
import { setSidePanelOpen, setSidePanelTab, addToast } from '../../store/slices/uiSlice';
import { saveLocation, getSavedLocations, deleteLocation } from '../../services/locationService';
import { getDirections } from '../../services/routeService';

const useMapFunctions = () => {
  const dispatch = useDispatch();
  const { userLocation, selectedPlace } = useSelector(state => state.map);
  const { user } = useSelector(state => state.auth) || { user: null };

  // Mặc định tọa độ TP.HCM nếu không có dữ liệu
  const DEFAULT_COORDS = { lat: 10.776530, lng: 106.700981 }; // Ho Chi Minh City

  const handlePlaceSelect = useCallback((place) => {
    if (!place) {
      console.error("Attempted to handle undefined place");
      dispatch(addToast({ type: 'error', message: 'Không có dữ liệu địa điểm.' }));
      return;
    }

    console.log("Processing place in handlePlaceSelect:", place);

    // Extract coordinates safely
    let lat, lng;
    try {
      if (place.geometry && place.geometry.location) {
        // Handle Google Maps location object
        if (typeof place.geometry.location.lat === 'function') {
          lat = place.geometry.location.lat();
          lng = place.geometry.location.lng();
        } else {
          // Handle plain object
          lat = place.geometry.location.lat;
          lng = place.geometry.location.lng;
        }
      } else if (place.lat !== undefined && place.lng !== undefined) {
        // Handle direct lat/lng properties
        lat = place.lat;
        lng = place.lng;
      } else if (place.latitude !== undefined && place.longitude !== undefined) {
        // Handle other format
        lat = place.latitude;
        lng = place.longitude;
      } else {
        // Fallback to default coordinates with warning
        console.warn("Using default coordinates for place with no coordinates");
        lat = DEFAULT_COORDS.lat;
        lng = DEFAULT_COORDS.lng;
      }
    } catch (err) {
      console.error("Error extracting coordinates:", err);
      // Fallback to default
      lat = DEFAULT_COORDS.lat;
      lng = DEFAULT_COORDS.lng;
    }

    // Process photos safely
    let photoUrls = [];
    if (place.photoUrls && Array.isArray(place.photoUrls)) {
      // Use existing photoUrls if available
      photoUrls = place.photoUrls;
    } else if (place.photos && Array.isArray(place.photos)) {
      try {
        // Try to extract URLs from Google Maps photo objects
        photoUrls = place.photos
          .map(photo => {
            if (photo && photo.getUrl && typeof photo.getUrl === 'function') {
              try {
                return photo.getUrl({ maxWidth: 800, maxHeight: 600 });
              } catch (err) {
                console.warn("Error getting photo URL:", err);
                return null;
              }
            }
            // If it's already a URL string
            return typeof photo === 'string' ? photo : null;
          })
          .filter(url => url); // Filter out nulls
      } catch (err) {
        console.error("Error processing photos:", err);
      }
    }

    // Handle opening hours
    let isOpenNow = undefined;
    if (typeof place.is_open_now !== 'undefined') {
      isOpenNow = place.is_open_now;
    } else if (place.opening_hours) {
      // Try both new and old API formats
      if (typeof place.opening_hours.isOpen === 'function') {
        try {
          isOpenNow = place.opening_hours.isOpen();
        } catch (err) {
          console.warn("Error calling isOpen():", err);
        }
      } else if (typeof place.opening_hours.open_now !== 'undefined') {
        isOpenNow = place.opening_hours.open_now;
      }
    }

    // Get address in different possible formats
    const address = place.formatted_address || 
                    place.address || 
                    place.vicinity || 
                    `${lat}, ${lng}`;

    // Get name in different possible formats
    const name = place.name || 
                place.title || 
                address.split(',')[0] || 
                "Địa điểm đã chọn";

    // Build a clean, serializable place object
    const newPlace = {
      placeId: place.place_id || place.placeId || `custom-${Date.now()}`,
      name: name,
      lat: lat,
      lng: lng,
      address: address,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      types: Array.isArray(place.types) ? [...place.types] : [],
      phoneNumber: place.formatted_phone_number || place.international_phone_number || place.phoneNumber || "",
      website: place.website || "",
      photoUrls: photoUrls,
      is_open_now: isOpenNow,
      // Clean reviews to be serializable
      reviews: Array.isArray(place.reviews) 
        ? place.reviews.map(review => ({
            author_name: review.author_name || "Anonymous",
            rating: review.rating || 0,
            text: review.text || "",
            relative_time_description: review.relative_time_description || "",
            time: review.time || Date.now()
          }))
        : []
    };

    // Verify we have valid coordinates
    if (typeof newPlace.lat !== 'number' || typeof newPlace.lng !== 'number' || 
        isNaN(newPlace.lat) || isNaN(newPlace.lng)) {
      console.error("Invalid coordinates:", newPlace.lat, newPlace.lng);
      dispatch(addToast({ type: 'error', message: 'Địa điểm không có tọa độ hợp lệ.' }));
      return;
    }
      
    console.log("Setting selected place:", newPlace);
    
    // First update the map and data
    dispatch(setSelectedPlace(newPlace));
    dispatch(setCenter({ lat: newPlace.lat, lng: newPlace.lng }));
    dispatch(setZoom(16));
    
    // Add to search history only for Google Places results
    if (place.place_id) {
      dispatch(addRecentSearch(newPlace));
    }
    
    // Now ensure the side panel is open with the right tab
    // Use setTimeout to ensure this happens after React has processed the previous dispatches
    setTimeout(() => {
      console.log("Opening side panel for place:", newPlace.name);
      dispatch(setDirections(null)); // Clear any existing directions
      dispatch(setSidePanelTab(0));   // Set to info tab
      dispatch(setSidePanelOpen(true)); // Make sure panel is open and stays open
    }, 10);

  }, [dispatch]);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Your Location"
          };
          dispatch(setUserLocation(userPos));
          dispatch(setCenter({ lat: userPos.lat, lng: userPos.lng }));
          dispatch(setZoom(15));
          dispatch(addToast({
            type: 'success',
            message: 'Đã xác định vị trí của bạn'
          }));
        },
        (error) => {
          console.error("Error getting user location:", error);
          dispatch(addToast({
            type: 'error',
            message: 'Không thể xác định vị trí của bạn. Kiểm tra quyền truy cập.'
          }));
        }
      );
    } else {
      dispatch(addToast({
        type: 'error',
        message: 'Trình duyệt của bạn không hỗ trợ định vị.'
      }));
    }
  }, [dispatch]);

  const fetchSavedLocations = useCallback(async () => {
    if (user) {
      try {
        const response = await getSavedLocations(user.username);
        dispatch(setSavedLocations(response.data));
      } catch (error) {
        console.error("Failed to fetch saved locations:", error);
        dispatch(addToast({
          type: 'error',
          message: 'Không thể tải danh sách địa điểm đã lưu'
        }));
      }
    }
  }, [dispatch, user]);

  const handleSaveLocation = useCallback(async () => {
    if (!selectedPlace) {
        dispatch(addToast({ type: 'warning', message: 'Không có địa điểm để lưu.' }));
        return;
    }
    if (!user) {
        dispatch(addToast({ type: 'warning', message: 'Bạn cần đăng nhập để lưu địa điểm.' }));
        return;
    }
    
    // Đảm bảo chỉ có dữ liệu an toàn được lưu
    const locationDataToSave = {
        placeId: selectedPlace.placeId,
        name: selectedPlace.name,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        address: selectedPlace.address,
        photoUrls: selectedPlace.photoUrls || [], // Chỉ lưu URLs
        rating: selectedPlace.rating,
        user_ratings_total: selectedPlace.user_ratings_total,
        types: selectedPlace.types,
        phoneNumber: selectedPlace.phoneNumber,
        website: selectedPlace.website,
        user: user.username
    };

    try {
      await saveLocation(locationDataToSave);
      dispatch(addSavedLocation(locationDataToSave));
      dispatch(addToast({
        type: 'success',
        message: 'Đã lưu địa điểm thành công!'
      }));
    } catch (error) {
      console.error("Failed to save location:", error);
      dispatch(addToast({
        type: 'error',
        message: error.response?.data?.message || 'Không thể lưu địa điểm.'
      }));
    }
  }, [dispatch, selectedPlace, user]);

  const handleDeleteLocation = useCallback(async (locationId) => {
    if (!user) return;
    
    try {
      await deleteLocation(locationId);
      dispatch(removeSavedLocation(locationId));
      dispatch(addToast({
        type: 'success',
        message: 'Đã xóa địa điểm thành công'
      }));
    } catch (error) {
      console.error("Failed to delete location:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Không thể xóa địa điểm'
      }));
    }
  }, [dispatch, user]);

  const handleGetDirections = useCallback(async (origin, destination) => {
    if (!origin || !destination) {
      dispatch(addToast({
        type: 'warning',
        message: 'Vui lòng chọn điểm xuất phát và điểm đến'
      }));
      return;
    }
    
    try {
      const originCoords = origin.geometry?.location ? {
        lat: origin.geometry.location.lat(),
        lng: origin.geometry.location.lng()
      } : { lat: origin.lat, lng: origin.lng };
      
      const destinationCoords = destination.geometry?.location ? {
        lat: destination.geometry.location.lat(),
        lng: destination.geometry.location.lng()
      } : { lat: destination.lat, lng: destination.lng };
      
      const response = await getDirections(originCoords, destinationCoords);
      
      // First update the direction data
      dispatch(setDirections(response.data));
      
      // Then ensure the panel is open and showing the right tab
      setTimeout(() => {
        console.log("Opening directions panel");
        dispatch(setSidePanelTab(1)); 
        dispatch(setSidePanelOpen(true));
      }, 10);
      
    } catch (error) {
      console.error("Failed to get directions:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Không thể tìm đường đi. Vui lòng thử địa điểm khác.'
      }));
    }
  }, [dispatch]);

  const handleDirectionsFromUserLocation = useCallback((destination) => {
    if (!userLocation) {
      getUserLocation();
      setTimeout(() => {
        if (userLocation && destination) {
          handleGetDirections(userLocation, destination);
        } else {
          dispatch(addToast({
            type: 'warning',
            message: 'Không thể xác định vị trí của bạn. Hãy chọn điểm xuất phát thủ công.'
          }));
        }
      }, 1000);
    } else {
      handleGetDirections(userLocation, destination);
    }
  }, [dispatch, getUserLocation, handleGetDirections, userLocation]);

  const clearDirections = useCallback(() => {
    dispatch(setDirections(null));
  }, [dispatch]);

  return {
    handlePlaceSelect,
    getUserLocation,
    fetchSavedLocations,
    handleSaveLocation,
    handleDeleteLocation,
    handleGetDirections,
    handleDirectionsFromUserLocation,
    clearDirections
  };
};

export default useMapFunctions; 