import React from 'react';
import { Box, Fab, Tooltip, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LayersIcon from '@mui/icons-material/Layers';
import TrafficIcon from '@mui/icons-material/Traffic';
import TerrainIcon from '@mui/icons-material/Terrain';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import { setMapType, toggleTraffic, setSidePanelOpen, setSidePanelTab } from '../../store/slices/uiSlice';

const MapControls = () => {
  const dispatch = useDispatch();
  const { showTraffic, mapType, isMobileView } = useSelector(state => state.ui);
  const { directions } = useSelector(state => state.map);
  const { getUserLocation } = useMapFunctions();

  // Các tùy chọn cho kiểu bản đồ
  const mapTypeActions = [
    { 
      icon: <MapIcon />, 
      name: 'Bản đồ thường', 
      action: () => dispatch(setMapType('roadmap')) 
    },
    { 
      icon: <SatelliteIcon />, 
      name: 'Vệ tinh', 
      action: () => dispatch(setMapType('satellite')) 
    },
    { 
      icon: <TerrainIcon />, 
      name: 'Địa hình', 
      action: () => dispatch(setMapType('terrain')) 
    },
    { 
      icon: <TrafficIcon color={showTraffic ? 'primary' : 'inherit'} />, 
      name: showTraffic ? 'Ẩn giao thông' : 'Hiện giao thông', 
      action: () => dispatch(toggleTraffic()) 
    }
  ];

  const handleOpenDirections = () => {
    dispatch(setSidePanelTab('directions'));
    dispatch(setSidePanelOpen(true));
  };

  return (
    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Nút tìm vị trí của tôi */}
        <Tooltip title="Vị trí của tôi" placement="left">
          <Fab 
            color="primary" 
            size="medium" 
            onClick={getUserLocation}
          >
            <MyLocationIcon />
          </Fab>
        </Tooltip>

        {/* Speedial để thay đổi kiểu bản đồ */}
        <SpeedDial
          ariaLabel="Map options"
          icon={<LayersIcon />}
          direction="up"
          FabProps={{ 
            size: 'medium',
            color: 'secondary'
          }}
        >
          {mapTypeActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
              tooltipOpen={isMobileView}
            />
          ))}
        </SpeedDial>
      </Box>
    </Box>
  );
};

export default MapControls; 