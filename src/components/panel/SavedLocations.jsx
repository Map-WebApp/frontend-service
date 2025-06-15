import React, { useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction,
  IconButton, 
  Typography, 
  Divider,
  Button,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsIcon from '@mui/icons-material/Directions';
import EditIcon from '@mui/icons-material/Edit';
import useMapFunctions from '../../hooks/map/useMapFunctions';

const SavedLocations = () => {
  const { savedLocations } = useSelector(state => state.map);
  const { user } = useSelector(state => state.auth) || { user: null };
  const { fetchSavedLocations, handlePlaceSelect, handleDeleteLocation, handleDirectionsFromUserLocation } = useMapFunctions();

  // Fetch savedLocations when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    }
  }, [user, fetchSavedLocations]);

  // Handle click on a saved location
  const handleLocationClick = (location) => {
    handlePlaceSelect(location);
  };

  // Get directions to a saved location
  const handleGetDirections = (location, event) => {
    event.stopPropagation(); // Prevent triggering the ListItem click
    handleDirectionsFromUserLocation(location);
  };

  // Delete a saved location
  const handleDelete = (locationId, event) => {
    event.stopPropagation(); // Prevent triggering the ListItem click
    handleDeleteLocation(locationId);
  };

  // No locations saved message
  if (savedLocations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        {user ? (
          <>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Bạn chưa lưu địa điểm nào
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Địa điểm đã lưu sẽ được hiển thị tại đây để bạn có thể truy cập nhanh
            </Typography>
          </>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Đăng nhập để lưu và xem các địa điểm yêu thích của bạn
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <List sx={{ p: 0 }}>
        {savedLocations.map((location, index) => (
          <React.Fragment key={location._id || `saved-${index}`}>
            <ListItem 
              button
              onClick={() => handleLocationClick(location)}
              sx={{
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <LocationOnIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body1" noWrap>
                    {location.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {location.address}
                  </Typography>
                }
                sx={{ pr: 8 }} // Make room for action buttons
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="directions"
                  onClick={(e) => handleGetDirections(location, e)}
                  size="small"
                  sx={{ mr: 0.5 }}
                >
                  <DirectionsIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={(e) => handleDelete(location._id, e)}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < savedLocations.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </motion.div>
  );
};

export default SavedLocations; 