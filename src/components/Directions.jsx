import React, { useState } from 'react';
import { Box, Button, TextField, Paper, Typography, IconButton, CircularProgress, Collapse } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { getDirections } from '../services/routeService';
import DirectionsIcon from '@mui/icons-material/Directions';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';

const Directions = ({ onDirectionsFound }) => {
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [originAutocomplete, setOriginAutocomplete] = useState(null);
    const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const onOriginLoad = (autoC) => {
        setOriginAutocomplete(autoC);
        if (autoC) {
            autoC.setComponentRestrictions({ country: 'vn' });
        }
    };
    
    const onDestinationLoad = (autoC) => {
        setDestinationAutocomplete(autoC);
        if (autoC) {
            autoC.setComponentRestrictions({ country: 'vn' });
        }
    };

    const onOriginChanged = () => {
        if (originAutocomplete) {
            const place = originAutocomplete.getPlace();
            if (place && place.geometry) {
                setOrigin(place);
                setError(null);
            }
        }
    };

    const onDestinationChanged = () => {
        if (destinationAutocomplete) {
            const place = destinationAutocomplete.getPlace();
            if (place && place.geometry) {
                setDestination(place);
                setError(null);
            }
        }
    };

    const handleFindRoute = async () => {
        if (!origin || !destination) {
            setError("Please select both origin and destination.");
            return;
        }
        
        try {
            setIsLoading(true);
            setError(null);
            
            const originCoords = {
                lat: origin.geometry.location.lat(),
                lng: origin.geometry.location.lng()
            };
            const destinationCoords = {
                lat: destination.geometry.location.lat(),
                lng: destination.geometry.location.lng()
            };
            
            const response = await getDirections(originCoords, destinationCoords);
            onDirectionsFound(response.data);
        } catch (error) {
            console.error("Failed to get directions:", error);
            setError("Could not find directions. Please try different locations.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDirections = () => {
        onDirectionsFound(null);
        setOrigin(null);
        setDestination(null);
    };

    const swapLocations = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                position: 'absolute', 
                top: 80, 
                right: 10, 
                zIndex: 1, 
                width: { xs: '90%', sm: 350 },
                maxWidth: '95%',
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            <Box 
                sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    cursor: 'pointer',
                }} 
                onClick={() => setExpanded(!expanded)}
            >
                <DirectionsIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Find Directions</Typography>
                <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}>
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginChanged}>
                            <TextField 
                                fullWidth 
                                variant="outlined"
                                label="Origin"
                                placeholder="Starting point" 
                                size="small"
                                value={origin?.name || ''}
                            />
                        </Autocomplete>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <IconButton 
                            onClick={swapLocations} 
                            size="small"
                            disabled={!origin || !destination}
                            sx={{
                                border: '1px solid #e0e0e0',
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                    backgroundColor: '#e0e0e0'
                                }
                            }}
                        >
                            <SwapVertIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                        <Autocomplete onLoad={onDestinationLoad} onPlaceChanged={onDestinationChanged}>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                label="Destination" 
                                placeholder="Where to?"
                                size="small"
                                value={destination?.name || ''}
                            />
                        </Autocomplete>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleFindRoute} 
                            fullWidth
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DirectionsIcon />}
                        >
                            Get Directions
                        </Button>
                        <Button 
                            variant="outlined"
                            onClick={handleClearDirections}
                            disabled={isLoading}
                            startIcon={<ClearIcon />}
                        >
                            Clear
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default Directions; 