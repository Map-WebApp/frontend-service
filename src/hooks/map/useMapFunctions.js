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
  setMapInstance
} from '../../store/slices/mapSlice';
import { addRecentSearch } from '../../store/slices/searchSlice';
import { setSidePanelOpen, setSidePanelTab, addToast } from '../../store/slices/uiSlice';
import { saveLocation, getSavedLocations, deleteLocation } from '../../services/locationService';
import { getDirections } from '../../services/routeService';

const useMapFunctions = () => {
  const dispatch = useDispatch();
  const { mapInstance, userLocation, selectedPlace } = useSelector(state => state.map);
  const { user } = useSelector(state => state.auth) || { user: null };

  const handleMapLoad = useCallback((map) => {
    dispatch(setMapInstance(map));
  }, [dispatch]);

  const handlePlaceSelect = useCallback((place) => {
    if (place && place.geometry && place.geometry.location) {
      const newPlace = {
        placeId: place.place_id || `place-${Date.now()}`,
        name: place.name || place.formatted_address || "Selected Location",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address || "",
        photos: place.photos || [],
        rating: place.rating || 0,
        types: place.types || [],
        phoneNumber: place.formatted_phone_number || "",
        website: place.website || "",
      };
      
      dispatch(setSelectedPlace(newPlace));
      dispatch(setCenter({ lat: newPlace.lat, lng: newPlace.lng }));
      dispatch(setZoom(16));
      dispatch(addRecentSearch(newPlace));
      dispatch(setSidePanelOpen(true));
      dispatch(setSidePanelTab('info'));
    }
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
    if (!selectedPlace || !user) {
      if (!user) {
        dispatch(addToast({
          type: 'warning',
          message: 'Bạn cần đăng nhập để lưu địa điểm'
        }));
      }
      return;
    }
    
    try {
      const locationData = { 
        ...selectedPlace, 
        user: user.username 
      };
      await saveLocation(locationData);
      dispatch(addSavedLocation(locationData));
      dispatch(addToast({
        type: 'success',
        message: 'Đã lưu địa điểm thành công'
      }));
    } catch (error) {
      console.error("Failed to save location:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Không thể lưu địa điểm'
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
      dispatch(setDirections(response.data));
      dispatch(setSidePanelTab('directions'));
      dispatch(setSidePanelOpen(true));
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
    handleMapLoad,
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