import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, IconButton, CircularProgress, Paper, List, ListItem, ListItemText, ListItemIcon, Typography, Divider, Fade } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import { useDispatch, useSelector } from 'react-redux';
import useSearch from '../../hooks/map/useSearch';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled components
const SearchPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: 24,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  padding: theme.spacing(0.5, 2),
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 0',
  }
});

const SuggestionsPaper = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  maxHeight: 350,
  overflowY: 'auto',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: theme.spacing(1),
  zIndex: 1400,
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}));

const MotionBox = styled(motion.div)({
  width: '100%',
});

const SearchBox = () => {
  const [focused, setFocused] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  
  const { searchText, autocomplete, onAutocompleteLoad, handleSearchTextChange, handlePlaceChanged, clearSearch } = useSearch();
  const { handlePlaceSelect } = useMapFunctions();
  
  const { isSearching, searchSuggestions, recentSearches } = useSelector(state => state.search);
  const { isMobileView } = useSelector(state => state.ui);

  // Xử lý khi chọn địa điểm từ autocomplete
  const onPlaceSelect = () => {
    const place = handlePlaceChanged();
    if (place) {
      handlePlaceSelect(place);
      clearSearch();
      setSuggestionsVisible(false);
    }
  };

  // Xử lý khi chọn từ danh sách gợi ý
  const handleSuggestionSelect = (suggestion) => {
    handlePlaceSelect(suggestion);
    clearSearch();
    setSuggestionsVisible(false);
  };

  // Hiển thị gợi ý khi focus và có dữ liệu
  useEffect(() => {
    setSuggestionsVisible(focused && (searchText.length > 0 || recentSearches.length > 0));
  }, [focused, searchText, recentSearches]);

  // Bắt đầu tìm kiếm bằng giọng nói
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'vi-VN';
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSearchTextChange(transcript);
    };
    
    recognition.start();
  };

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 20, 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: { xs: '90%', sm: '70%', md: 500 }, 
      zIndex: 100,
      transition: 'width 0.3s ease'
    }}>
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SearchPaper 
          elevation={focused ? 3 : 1}
          sx={{ 
            width: '100%',
            backgroundColor: 'white',
          }}
        >
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceSelect}
            options={{ 
              componentRestrictions: { country: 'vn' },
              types: ['geocode', 'establishment']
            }}
          >
            <StyledTextField
              fullWidth
              autoComplete="off"
              placeholder="Tìm kiếm địa điểm, tòa nhà, địa chỉ..."
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : searchText ? (
                      <IconButton 
                        edge="end" 
                        onClick={clearSearch}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton 
                        edge="end" 
                        onClick={startVoiceSearch}
                        size="small"
                      >
                        <MicIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Autocomplete>
        </SearchPaper>
        
        {suggestionsVisible && (
          <Fade in={suggestionsVisible}>
            <SuggestionsPaper elevation={3}>
              {searchText && searchSuggestions.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ p: 1.5, pb: 0.5 }}>
                    Gợi ý
                  </Typography>
                  <List dense>
                    {searchSuggestions.map((suggestion, index) => (
                      <ListItem 
                        key={`suggestion-${index}`} 
                        button
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LocationOnIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={suggestion.name}
                          secondary={suggestion.address}
                          primaryTypographyProps={{ 
                            noWrap: true,
                            style: { fontWeight: 500 } 
                          }}
                          secondaryTypographyProps={{ 
                            noWrap: true,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                </>
              )}

              {recentSearches.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ p: 1.5, pb: 0.5 }}>
                    Tìm kiếm gần đây
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {recentSearches.slice(0, 5).map((item, index) => (
                      <ListItem 
                        key={`recent-${index}`} 
                        button
                        onClick={() => handleSuggestionSelect(item)}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <HistoryIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.name}
                          secondary={item.address}
                          primaryTypographyProps={{ noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </SuggestionsPaper>
          </Fade>
        )}
      </MotionBox>
    </Box>
  );
};

export default SearchBox; 