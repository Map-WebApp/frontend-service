import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  IconButton, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import DirectionsIcon from '@mui/icons-material/Directions';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import useMapFunctions from '../../hooks/map/useMapFunctions';

// Styled components
const DirectionsTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 24,
    backgroundColor: theme.palette.background.paper,
  }
}));

// Travel mode options
const travelModes = [
  { value: 'DRIVING', icon: <DirectionsCarIcon />, label: 'Lái xe' },
  { value: 'WALKING', icon: <DirectionsWalkIcon />, label: 'Đi bộ' },
  { value: 'BICYCLING', icon: <DirectionsBikeIcon />, label: 'Xe đạp' },
  { value: 'TRANSIT', icon: <DirectionsTransitIcon />, label: 'Công cộng' },
];

const DirectionsPanel = () => {
  const dispatch = useDispatch();
  const { directions, userLocation } = useSelector(state => state.map);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [travelMode, setTravelMode] = useState('DRIVING');
  
  const originAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);
  
  const { handleGetDirections, clearDirections, getUserLocation } = useMapFunctions();

  // Xử lý khi onLoad autocomplete
  const onOriginLoad = (autocomplete) => {
    originAutocompleteRef.current = autocomplete;
    if (autocomplete) {
      autocomplete.setComponentRestrictions({ country: 'vn' });
    }
  };

  const onDestinationLoad = (autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
    if (autocomplete) {
      autocomplete.setComponentRestrictions({ country: 'vn' });
    }
  };

  // Xử lý khi chọn địa điểm từ autocomplete
  const handleOriginSelect = () => {
    const place = originAutocompleteRef.current?.getPlace();
    if (place && place.geometry) {
      setOrigin(place);
      setOriginInput(place.formatted_address || place.name);
    }
  };

  const handleDestinationSelect = () => {
    const place = destinationAutocompleteRef.current?.getPlace();
    if (place && place.geometry) {
      setDestination(place);
      setDestinationInput(place.formatted_address || place.name);
    }
  };

  // Sử dụng vị trí hiện tại của người dùng làm điểm bắt đầu
  const useCurrentLocation = () => {
    if (!userLocation) {
      getUserLocation();
    } else {
      setOrigin({
        geometry: {
          location: {
            lat: () => userLocation.lat,
            lng: () => userLocation.lng
          }
        },
        name: 'Vị trí hiện tại',
        formatted_address: 'Vị trí của bạn'
      });
      setOriginInput('Vị trí của bạn');
    }
  };

  // Hoán đổi điểm đi và điểm đến
  const swapLocations = () => {
    const tempOrigin = origin;
    const tempOriginInput = originInput;
    
    setOrigin(destination);
    setOriginInput(destinationInput);
    
    setDestination(tempOrigin);
    setDestinationInput(tempOriginInput);
  };

  // Xử lý khi nhấn nút tìm đường đi
  const handleFindRoute = async () => {
    if (!origin || !destination) {
      alert('Vui lòng chọn điểm xuất phát và điểm đến');
      return;
    }

    setIsLoading(true);
    await handleGetDirections(origin, destination);
    setIsLoading(false);
  };

  // Xử lý xóa chỉ đường
  const handleClearDirections = () => {
    clearDirections();
    setOrigin(null);
    setDestination(null);
    setOriginInput('');
    setDestinationInput('');
  };

  // Biến đổi dữ liệu chỉ đường thành danh sách các bước
  const getDirectionSteps = () => {
    if (!directions || !directions.routes || !directions.routes[0]) return [];
    
    const route = directions.routes[0];
    const leg = route.legs[0]; // Chỉ lấy leg đầu tiên (trường hợp không có waypoints)
    
    return leg.steps.map(step => ({
      instruction: step.instructions,
      distance: step.distance.text,
      duration: step.duration.text
    }));
  };

  const steps = getDirectionSteps();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 2 }}>
        {/* Chọn phương tiện di chuyển */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          {travelModes.map((mode) => (
            <Chip
              key={mode.value}
              icon={mode.icon}
              label={mode.label}
              onClick={() => setTravelMode(mode.value)}
              color={travelMode === mode.value ? 'primary' : 'default'}
              sx={{ px: 1 }}
            />
          ))}
        </Box>
        
        {/* Nhập điểm đi và điểm đến */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              size="small" 
              sx={{ mr: 1 }} 
              onClick={useCurrentLocation}
            >
              <MyLocationIcon color="primary" />
            </IconButton>
            <Autocomplete onLoad={onOriginLoad} onPlaceChanged={handleOriginSelect}>
              <DirectionsTextField
                fullWidth
                label="Điểm xuất phát"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                size="small"
              />
            </Autocomplete>
          </Box>
          
          {/* Nút hoán đổi */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1 }}>
            <IconButton 
              onClick={swapLocations} 
              disabled={!origin || !destination}
              sx={{ 
                border: '1px dashed', 
                borderColor: 'divider',
                bgcolor: 'background.paper' 
              }}
            >
              <SwapVertIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 40, textAlign: 'center', mr: 1 }}>
              <DirectionsIcon color="secondary" />
            </Box>
            <Autocomplete onLoad={onDestinationLoad} onPlaceChanged={handleDestinationSelect}>
              <DirectionsTextField
                fullWidth
                label="Điểm đến"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                size="small"
              />
            </Autocomplete>
          </Box>
        </Paper>
        
        {/* Nút tìm đường đi */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            fullWidth
            onClick={handleFindRoute}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <DirectionsIcon />}
          >
            Tìm đường
          </Button>
          <Button 
            variant="outlined"
            onClick={handleClearDirections}
            disabled={!directions}
            startIcon={<ClearIcon />}
          >
            Xóa
          </Button>
        </Box>
      </Box>
      
      {/* Hiển thị thông tin chỉ đường */}
      {directions && (
        <>
          <Divider />
          
          {/* Tổng quát về chuyến đi */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'white' }}>
            {directions.routes[0]?.legs[0] && (
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {directions.routes[0].legs[0].distance.text} • {directions.routes[0].legs[0].duration.text}
                </Typography>
                <Typography variant="body2">
                  Từ {directions.routes[0].legs[0].start_address.split(',')[0]} đến {directions.routes[0].legs[0].end_address.split(',')[0]}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Danh sách các bước */}
          <List sx={{ p: 0 }}>
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                    }
                    secondary={`${step.distance} • ${step.duration}`}
                    primaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < steps.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </motion.div>
  );
};

export default DirectionsPanel; 