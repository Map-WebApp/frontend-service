import React from 'react';
import { Box, IconButton, Paper, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TrafficIcon from '@mui/icons-material/Traffic';
import LayersIcon from '@mui/icons-material/Layers';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTraffic, setMapType } from '../../store/slices/uiSlice';
import useMapFunctions from '../../hooks/map/useMapFunctions';
import { motion } from 'framer-motion';

const MapControls = () => {
    const dispatch = useDispatch();
    const { getUserLocation } = useMapFunctions();
    const { showTraffic, mapType } = useSelector(state => state.ui);

    const handleToggleTraffic = () => {
        dispatch(toggleTraffic());
    };
    
    const handleMapTypeChange = () => {
        const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
        dispatch(setMapType(newType));
    };

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        >
            <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Tooltip title="Vị trí của tôi" placement="left">
                    <IconButton onClick={getUserLocation}>
                        <MyLocationIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={showTraffic ? "Ẩn giao thông" : "Hiện giao thông"} placement="left">
                    <IconButton onClick={handleToggleTraffic} color={showTraffic ? 'primary' : 'default'}>
                        <TrafficIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={mapType === 'roadmap' ? "Chế độ vệ tinh" : "Chế độ bản đồ"} placement="left">
                    <IconButton onClick={handleMapTypeChange}>
                        <LayersIcon />
                    </IconButton>
                </Tooltip>
            </Paper>
        </motion.div>
    );
};

export default MapControls; 