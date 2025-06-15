import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  Typography, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Rating,
  Chip,
  Avatar,
  Slide
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSidePanelOpen, setSidePanelTab } from '../../store/slices/uiSlice';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceInfo from './PlaceInfo';
import DirectionsPanel from './DirectionsPanel';
import SavedLocations from './SavedLocations';

const drawerWidth = {
  xs: '100%',
  sm: 360,
  md: 380
};

// Component cho header của panel
const PanelHeader = ({ title, onClose }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    p: 2, 
    backgroundColor: 'primary.main', 
    color: 'white' 
  }}>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      {title}
    </Typography>
    <IconButton color="inherit" onClick={onClose} edge="end">
      <CloseIcon />
    </IconButton>
  </Box>
);

const SidePanel = () => {
  const dispatch = useDispatch();
  const { sidePanelOpen, sidePanelTab, isMobileView } = useSelector(state => state.ui);
  const { selectedPlace, directions } = useSelector(state => state.map);

  const handleClose = () => {
    dispatch(setSidePanelOpen(false));
  };

  const handleTabChange = (event, newValue) => {
    dispatch(setSidePanelTab(newValue));
  };

  // Xác định tiêu đề cho panel
  const getPanelTitle = () => {
    switch (sidePanelTab) {
      case 'info':
        return selectedPlace ? selectedPlace.name : 'Thông tin địa điểm';
      case 'directions':
        return 'Chỉ đường';
      case 'saved':
        return 'Địa điểm đã lưu';
      default:
        return 'Maps WebApp';
    }
  };

  const handleDrawerTransitionEnd = () => {
    // Chỉ reset panel khi đóng để tránh hiệu ứng giật
    if (!sidePanelOpen) {
      // Logic khi đóng panel hoàn toàn
    }
  };

  return (
    <Drawer
      anchor={isMobileView ? 'bottom' : 'right'}
      open={sidePanelOpen}
      variant="temporary"
      onClose={handleClose}
      onTransitionEnd={handleDrawerTransitionEnd}
      ModalProps={{
        keepMounted: true, // Tối ưu hóa hiệu suất trên mobile
      }}
      PaperProps={{
        sx: {
          width: drawerWidth,
          maxWidth: isMobileView ? '100%' : 450,
          borderRadius: isMobileView ? '16px 16px 0 0' : 0,
          maxHeight: isMobileView ? 'calc(100% - 56px)' : '100%',
          overflow: 'hidden',
        }
      }}
    >
      <PanelHeader 
        title={getPanelTitle()} 
        onClose={handleClose} 
      />

      <Tabs 
        value={sidePanelTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Thông tin" value="info" disabled={!selectedPlace} />
        <Tab label="Chỉ đường" value="directions" />
        <Tab label="Đã lưu" value="saved" />
      </Tabs>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {sidePanelTab === 'info' && <PlaceInfo />}
        {sidePanelTab === 'directions' && <DirectionsPanel />}
        {sidePanelTab === 'saved' && <SavedLocations />}
      </Box>
    </Drawer>
  );
};

export default SidePanel; 