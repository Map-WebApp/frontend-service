import React, { createContext, useContext, useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

const GoogleMapsContext = createContext();

// Libraries to load with Google Maps
const libraries = ['places'];

export const GoogleMapsProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    id: 'google-map-script',
  });

  const [isBlocked, setIsBlocked] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // Handle Maps API loading errors
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps API load error:', loadError);
      
      // Check if error is due to ad-blocker or content blocker
      if (loadError.message && (
          loadError.message.includes("blocked by the client") || 
          loadError.message.includes("ERR_BLOCKED_BY_CLIENT") ||
          loadError.message.includes("Failed to load")
      )) {
        setIsBlocked(true);
        setErrorDetails("Ad blocker is preventing Google Maps from loading");
        dispatch(addToast({
          type: 'error',
          message: 'Google Maps bị chặn bởi trình duyệt. Vui lòng tắt AdBlock hoặc các tiện ích tương tự.'
        }));
      } else {
        // Handle other types of errors
        setErrorDetails(loadError.message);
        dispatch(addToast({
          type: 'error',
          message: 'Lỗi khi tải Google Maps: ' + loadError.message
        }));
      }
    }
  }, [loadError, dispatch]);

  // Provide context values to children
  return (
    <GoogleMapsContext.Provider value={{ 
      isLoaded, 
      loadError, 
      isBlocked, 
      errorDetails 
    }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
}; 