import React, { useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import MapControls from './MapControls';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { setSidePanelOpen } from '../../store/slices/uiSlice';

// Tùy chỉnh marker trọng tâm cho các địa điểm đã lưu
const savedLocationIcon = {
  path: 'M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z',
  fillColor: '#4CAF50',
  fillOpacity: 1,
  strokeColor: '#FFFFFF',
  strokeWeight: 2,
  scale: 1.4,
};

// Marker cho vị trí người dùng
const userLocationIcon = {
  path: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  fillColor: '#1976D2',
  fillOpacity: 1,
  strokeColor: '#FFFFFF',
  strokeWeight: 2,
  scale: 1.2,
};

const MotionBox = styled(motion.div)({
  width: '100%',
  height: '100%',
});

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const MapView = () => {
  const dispatch = useDispatch();
  const { center, zoom, userLocation, selectedPlace, savedLocations, directions } = useSelector(state => state.map);
  const { showTraffic, mapType } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth) || { user: null };

  const { handleMapLoad, fetchSavedLocations, handleSaveLocation, handlePlaceSelect } = useMapFunctions();
  
  // Tải Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'directions'],
  });

  // Lấy danh sách địa điểm đã lưu khi component được mount
  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    }
  }, [user, fetchSavedLocations]);

  // Xử lý khi người dùng đóng InfoWindow
  const handleInfoWindowClose = useCallback(() => {
    dispatch(setSidePanelOpen(false));
  }, [dispatch]);

  // Hiệu ứng trượt khi thay đổi center
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeId: mapType,
    clickableIcons: true,
    gestureHandling: 'greedy',
  };

  // Hiển thị lỗi nếu không tải được bản đồ
  if (loadError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        bgcolor: '#f5f5f5',
        flexDirection: 'column',
        p: 3,
        textAlign: 'center'
      }}>
        <h3>Không thể tải Google Maps</h3>
        <p>Vui lòng kiểm tra kết nối mạng và API key.</p>
        <code>{loadError.message}</code>
      </Box>
    );
  }

  return isLoaded ? (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{ position: 'relative' }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={mapOptions}
      >
        {/* Lớp hiển thị giao thông (nếu được bật) */}
        {showTraffic && <TrafficLayer />}
        
        {/* Marker cho vị trí hiện tại của người dùng */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={userLocationIcon}
            animation={window.google.maps.Animation.DROP}
          />
        )}
        
        {/* Marker cho địa điểm được chọn */}
        {selectedPlace && (
          <Marker 
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            animation={window.google.maps.Animation.DROP}
            onClick={() => dispatch(setSidePanelOpen(true))}
          />
        )}

        {/* Marker cho các địa điểm đã lưu */}
        {savedLocations.map((location) => (
          <Marker
            key={location._id || `saved-${location.lat}-${location.lng}`}
            position={{ lat: location.lat, lng: location.lng }}
            icon={savedLocationIcon}
            onClick={() => handlePlaceSelect(location)}
          />
        ))}

        {/* Hiển thị chỉ đường */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#1976D2',
                strokeWeight: 5,
                strokeOpacity: 0.8
              },
              suppressMarkers: false,
            }}
          />
        )}
      </GoogleMap>
      
      {/* Các nút điều khiển bản đồ */}
      <MapControls />
    </MotionBox>
  ) : (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      bgcolor: '#f5f5f5'
    }}>
      <p>Đang tải bản đồ...</p>
    </Box>
  );
};

export default MapView; 