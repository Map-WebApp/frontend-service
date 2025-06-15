import React, { useEffect, useRef } from 'react';
import { Box, Paper, Tabs, Tab, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsIcon from '@mui/icons-material/Directions';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CloseIcon from '@mui/icons-material/Close';
import { setSidePanelTab, setSidePanelOpen } from '../../store/slices/uiSlice';
import PlaceInfo from './PlaceInfo';
import DirectionsPanel from './DirectionsPanel';
import SavedLocations from './SavedLocations';
import { motion, AnimatePresence } from 'framer-motion';

const SidePanel = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { isSidePanelOpen, sidePanelTab } = useSelector(state => state.ui);
    const { selectedPlace, directions } = useSelector(state => state.map);
    const panelRef = useRef(null);

    // Make sure panel opens when place is selected
    useEffect(() => {
        if (selectedPlace && !isSidePanelOpen) {
            console.log("Selected place is present, opening side panel");
            dispatch(setSidePanelOpen(true));
            dispatch(setSidePanelTab(0)); // Show info tab for place
        }
    }, [selectedPlace, isSidePanelOpen, dispatch]);

    // Show directions tab when directions are available
    useEffect(() => {
        if (directions && sidePanelTab !== 1) {
            console.log("Directions are available, switching to directions tab");
            dispatch(setSidePanelTab(1));
            if (!isSidePanelOpen) {
                dispatch(setSidePanelOpen(true));
            }
        }
    }, [directions, sidePanelTab, isSidePanelOpen, dispatch]);

    // Force panel to be visible when needed
    useEffect(() => {
        if (isSidePanelOpen && panelRef.current) {
            panelRef.current.style.display = 'flex';
            panelRef.current.style.visibility = 'visible';
            panelRef.current.style.opacity = '1';
        }
    }, [isSidePanelOpen]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        dispatch(setSidePanelTab(newValue));
    };

    // Handle panel close
    const handleClosePanel = () => {
        dispatch(setSidePanelOpen(false));
    };

    if (!isSidePanelOpen) {
        return null; // Don't render anything if panel is closed
    }

    return (
        <div ref={panelRef} className="panel-wrapper">
            <motion.div
                key="side-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isMobile ? '100%' : 350, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="side-panel-container"
            >
                <Paper
                    elevation={4}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 0,
                    }}
                >
                    {/* Header with close button */}
                    <Box className="side-panel-header">
                        <Tabs
                            value={sidePanelTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ flexGrow: 1 }}
                        >
                            <Tab icon={<InfoIcon />} label="Thông tin" />
                            <Tab icon={<DirectionsIcon />} label="Chỉ đường" />
                            <Tab icon={<BookmarksIcon />} label="Đã lưu" />
                        </Tabs>
                        <IconButton 
                            onClick={handleClosePanel}
                            size="small"
                            className="close-button"
                            aria-label="close panel"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box className="side-panel-content">
                        {sidePanelTab === 0 && <PlaceInfo />}
                        {sidePanelTab === 1 && <DirectionsPanel />}
                        {sidePanelTab === 2 && <SavedLocations />}
                    </Box>
                </Paper>
            </motion.div>
        </div>
    );
};

export default SidePanel; 