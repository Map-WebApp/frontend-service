import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, CircularProgress, Paper } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import useSearch from '../../hooks/map/useSearch';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useGoogleMaps } from '../../context/GoogleMapsContext.jsx';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 50, // Pill shape
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    },
    '& fieldset': {
      border: 'none',
    },
    paddingLeft: theme.spacing(1), // Adjust padding for icon
  },
  '& .MuiInputBase-input': {
    padding: '14px 0',
  }
}));

const SearchBox = () => {
  const dispatch = useDispatch();
  const { searchText, onAutocompleteLoad, handleSearchTextChange, handlePlaceChanged, clearSearch } = useSearch();
  const { handlePlaceSelect } = useMapFunctions();
  const { isLoaded } = useGoogleMaps();
  const { isSearching } = useSelector(state => state.search);
  const [hasError, setHasError] = useState(false);

  const onPlaceSelect = () => {
    try {
      const place = handlePlaceChanged();
      console.log("Place selected:", place);
      
      if (!place) {
        console.error("No place returned from autocomplete");
        dispatch(addToast({
          type: 'error',
          message: 'Không thể lấy chi tiết địa điểm. Vui lòng thử lại.'
        }));
        setHasError(true);
        return;
      }
      
      // Kiểm tra dữ liệu địa điểm
      if (!place.geometry) {
        console.error("Place has no geometry:", place);
        dispatch(addToast({
          type: 'error',
          message: 'Địa điểm không có tọa độ. Vui lòng chọn một địa điểm từ gợi ý.'
        }));
        setHasError(true);
        return;
      }

      // Kiểm tra chi tiết còn thiếu và tự bổ sung
      if (!place.name && place.geometry) {
        place.name = "Địa điểm đã chọn";
      }
      
      // Reset lỗi nếu thành công
      setHasError(false);
      handlePlaceSelect(place);
      clearSearch();
    } catch (error) {
      console.error("Error in place selection:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Lỗi khi xử lý địa điểm. Vui lòng kiểm tra trình chặn quảng cáo và thử lại.'
      }));
      setHasError(true);
    }
  };

  const handleManualSearch = () => {
    if (searchText && searchText.trim() !== '') {
      // Tìm kiếm thủ công khi người dùng nhấn Enter
      try {
        if (window.google && window.google.maps && window.google.maps.places) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: searchText, region: 'vn' }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const place = results[0];
              handlePlaceSelect(place);
              clearSearch();
              setHasError(false);
            } else {
              dispatch(addToast({
                type: 'error',
                message: 'Không tìm thấy địa điểm. Vui lòng thử lại với từ khóa khác.'
              }));
              setHasError(true);
            }
          });
        } else {
          dispatch(addToast({
            type: 'error',
            message: 'Dịch vụ bản đồ chưa sẵn sàng. Vui lòng thử lại sau.'
          }));
          setHasError(true);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        dispatch(addToast({
          type: 'error',
          message: 'Lỗi khi tìm kiếm địa điểm. Vui lòng thử lại.'
        }));
        setHasError(true);
      }
    }
  };

  const startVoiceSearch = () => {
    try {
      // Kiểm tra hỗ trợ trình đọc giọng nói
      if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
        const SpeechRecognition = window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.lang = 'vi-VN';
        
        recognition.onresult = (event) => {
          if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript;
            handleSearchTextChange(transcript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
      } else {
        alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.');
      }
    } catch (error) {
      console.error('Voice search error:', error);
      alert('Không thể khởi động tìm kiếm bằng giọng nói.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  return (
    <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: { xs: 'calc(100% - 32px)', sm: 450 }, maxWidth: "90%", zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%' }}>
            {isLoaded && (
                <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceSelect}
                    options={{
                        componentRestrictions: { country: 'vn' },
                        types: ['establishment', 'geocode'],
                        fields: ['geometry', 'name', 'formatted_address', 'place_id', 'photos', 'rating', 'user_ratings_total', 'types', 'reviews', 'opening_hours', 'website', 'formatted_phone_number', 'international_phone_number']
                    }}
                >
                    <StyledTextField
                        fullWidth
                        autoComplete="off"
                        placeholder="Tìm kiếm địa điểm..."
                        value={searchText}
                        onChange={(e) => handleSearchTextChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        error={hasError}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon 
                                      color="action" 
                                      style={{cursor: 'pointer'}} 
                                      onClick={handleManualSearch}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {isSearching ? (
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                    ) : searchText ? (
                                        <IconButton edge="end" onClick={clearSearch} size="small" sx={{ mr: 0.5 }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <IconButton edge="end" onClick={startVoiceSearch} size="small" sx={{ mr: 0.5 }}>
                                            <MicIcon />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Autocomplete>
            )}
        </motion.div>
    </Box>
  );
};

export default SearchBox; 