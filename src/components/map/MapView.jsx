import React, { useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, Link } from '@mui/material';
import { GoogleMap, Marker, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BlockIcon from '@mui/icons-material/Block';
import { useDispatch, useSelector } from 'react-redux';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import MapControls from './MapControls';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { setSidePanelOpen } from '../../store/slices/uiSlice';
import { useGoogleMaps } from '../../context/GoogleMapsContext.jsx';

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

const ErrorOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  zIndex: 100,
  padding: '20px',
});

const MapView = () => {
  const dispatch = useDispatch();
  const { center, zoom, userLocation, selectedPlace, savedLocations, directions } = useSelector(state => state.map);
  const { showTraffic, mapType } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth) || { user: null };

  const { fetchSavedLocations, handlePlaceSelect } = useMapFunctions();
  const { isLoaded, loadError, isBlocked, errorDetails } = useGoogleMaps();
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

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

  // Reload trang
  const handleReloadPage = () => {
    window.location.reload();
  };

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

  // Hiển thị lỗi khi bị chặn bởi AdBlocker
  if (isBlocked) {
    return (
      <ErrorOverlay>
        <BlockIcon sx={{ fontSize: 64, mb: 3, color: '#ff5252' }} />
        <Typography variant="h5" gutterBottom>Google Maps API bị chặn</Typography>
        <Typography variant="body1" sx={{ mb: 2, maxWidth: 500 }}>
          Trình duyệt của bạn đang chặn Google Maps API, có thể do một tiện ích chặn quảng cáo như AdBlock hoặc uBlock Origin.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, maxWidth: 600 }}>
          Để sử dụng ứng dụng, bạn vui lòng:
        </Typography>
        <Box sx={{ textAlign: 'left', mb: 3, maxWidth: 450 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>1. Tắt tiện ích chặn quảng cáo cho trang web này</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>2. Hoặc thêm trang này vào danh sách loại trừ</Typography>
          <Typography variant="body1">3. Sau đó tải lại trang</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReloadPage}
          sx={{ mt: 2, mb: 2 }}
        >
          Tải lại trang
        </Button>
      </ErrorOverlay>
    );
  }

  // Hiển thị lỗi khác khi tải Maps API
  if (loadError && !isBlocked) {
    return (
      <ErrorOverlay>
        <ReportProblemIcon sx={{ fontSize: 64, mb: 3, color: '#ffb74d' }} />
        <Typography variant="h5" gutterBottom>Lỗi khi tải Google Maps</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {errorDetails || loadError.message || 'Không thể kết nối với Google Maps API'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReloadPage}
        >
          Thử lại
        </Button>
      </ErrorOverlay>
    );
  }

  // Chờ cho đến khi bản đồ được tải
  if (!isLoaded) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        flexDirection: 'column',
        bgcolor: '#f5f5f5'
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Đang tải bản đồ...</Typography>
        <Box sx={{ width: 100, height: 5, bgcolor: 'primary.main', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '30%',
              bgcolor: 'primary.dark',
              borderRadius: 2,
              animation: 'loadingAnimation 1.5s infinite',
              '@keyframes loadingAnimation': {
                '0%': {
                  left: '-30%',
                },
                '100%': {
                  left: '100%',
                },
              },
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
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
        onLoad={onMapLoad}
        options={mapOptions}
      >
        {/* Lớp hiển thị giao thông (nếu được bật) */}
        {showTraffic && <TrafficLayer />}
        
        {/* Marker cho vị trí hiện tại của người dùng */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={userLocationIcon}
            animation={2} // 2 = DROP
          />
        )}
        
        {/* Marker cho địa điểm được chọn */}
        {selectedPlace && (
          <Marker 
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            animation={2}
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
  );
};

export default MapView; 