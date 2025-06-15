import React from 'react';
import { Box, Typography, Button, Divider, Rating, Chip, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import { setSidePanelTab } from '../../store/slices/uiSlice';

// Component hiển thị bộ sưu tập hình ảnh
const PhotoGallery = ({ photos }) => {
  const hasPhotos = photos && photos.length > 0;
  
  if (!hasPhotos) {
    return (
      <Box sx={{ 
        height: 200, 
        bgcolor: 'grey.200', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="body2" color="textSecondary">Không có hình ảnh</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      overflowX: 'auto', 
      height: 200,
      scrollSnapType: 'x mandatory',
      '&::-webkit-scrollbar': {
        height: 4,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
      },
    }}>
      {photos.map((photo, index) => (
        <Box 
          key={index}
          component="img"
          sx={{
            height: '100%',
            minWidth: 280,
            objectFit: 'cover',
            scrollSnapAlign: 'start',
          }}
          src={photo.getUrl ? photo.getUrl() : 'https://via.placeholder.com/280x200?text=No+Image'}
          alt={`Location photo ${index + 1}`}
        />
      ))}
    </Box>
  );
};

// Component hiển thị thông tin địa điểm
const PlaceInfo = () => {
  const dispatch = useDispatch();
  const { selectedPlace } = useSelector(state => state.map);
  const { user } = useSelector(state => state.auth) || { user: null };
  const { handleSaveLocation, handleDirectionsFromUserLocation } = useMapFunctions();

  if (!selectedPlace) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Chọn một địa điểm trên bản đồ để xem thông tin
        </Typography>
      </Box>
    );
  }
  
  const handleGetDirections = () => {
    handleDirectionsFromUserLocation(selectedPlace);
    dispatch(setSidePanelTab('directions'));
  };

  const handleShare = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}&query_place_id=${selectedPlace.placeId}`;
    navigator.clipboard.writeText(url);
    alert('Đã sao chép liên kết chia sẻ');
  };

  const handleCall = () => {
    if (selectedPlace.phoneNumber) {
      window.location.href = `tel:${selectedPlace.phoneNumber}`;
    }
  };

  const handleWebsite = () => {
    if (selectedPlace.website) {
      window.open(selectedPlace.website, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Photo Gallery */}
      <PhotoGallery photos={selectedPlace.photos} />
      
      {/* Rating and Types */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={selectedPlace.rating || 0}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            {selectedPlace.rating ? `${selectedPlace.rating}/5` : 'Chưa có đánh giá'}
          </Typography>
        </Box>
        
        {/* Categories/Types */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedPlace.types && selectedPlace.types.map((type, idx) => (
            <Chip 
              key={idx} 
              label={type.replace(/_/g, ' ')} 
              size="small" 
              variant="outlined" 
            />
          ))}
        </Box>
        
        {/* Address */}
        <ListItem disableGutters sx={{ px: 0, py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LocationOnIcon color="action" fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={selectedPlace.address}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItem>
        
        {/* Phone Number */}
        {selectedPlace.phoneNumber && (
          <ListItem 
            disableGutters 
            sx={{ px: 0, py: 0.5 }}
            button
            onClick={handleCall}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PhoneIcon color="action" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={selectedPlace.phoneNumber}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        )}
        
        {/* Website */}
        {selectedPlace.website && (
          <ListItem 
            disableGutters 
            sx={{ px: 0, py: 0.5 }}
            button
            onClick={handleWebsite}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PublicIcon color="action" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={selectedPlace.website}
              primaryTypographyProps={{ 
                variant: 'body2',
                noWrap: true,
                sx: { color: 'primary.main' }
              }}
            />
          </ListItem>
        )}
      </Box>
      
      <Divider />
      
      {/* Action buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
        <Button 
          variant="contained" 
          startIcon={<DirectionsIcon />}
          onClick={handleGetDirections}
          sx={{ flexGrow: 1 }}
        >
          Chỉ đường
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<StarIcon />}
          onClick={handleSaveLocation}
          disabled={!user}
          sx={{ flexGrow: 1 }}
        >
          {user ? 'Lưu địa điểm' : 'Đăng nhập để lưu'}
        </Button>
        
        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
      </Box>
    </motion.div>
  );
};

export default PlaceInfo; 