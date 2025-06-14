import React, { useState } from 'react';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { getDirections } from '../services/routeService';

const Directions = ({ onDirectionsFound }) => {
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [originAutocomplete, setOriginAutocomplete] = useState(null);
    const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);

    const onOriginLoad = (autoC) => setOriginAutocomplete(autoC);
    const onDestinationLoad = (autoC) => setDestinationAutocomplete(autoC);

    const onOriginChanged = () => {
        if (originAutocomplete) {
            setOrigin(originAutocomplete.getPlace());
        }
    };

    const onDestinationChanged = () => {
        if (destinationAutocomplete) {
            setDestination(destinationAutocomplete.getPlace());
        }
    };

    const handleFindRoute = async () => {
        if (!origin || !destination) {
            alert("Please select both origin and destination.");
            return;
        }
        try {
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
            alert("Could not find directions.");
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, position: 'absolute', top: 80, left: 10, zIndex: 1, width: 350 }}>
            <Typography variant="h6" gutterBottom>Find Directions</Typography>
            <Box mb={2}>
                <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginChanged}>
                    <TextField fullWidth variant="outlined" label="Origin" />
                </Autocomplete>
            </Box>
            <Box mb={2}>
                <Autocomplete onLoad={onDestinationLoad} onPlaceChanged={onDestinationChanged}>
                    <TextField fullWidth variant="outlined" label="Destination" />
                </Autocomplete>
            </Box>
            <Button variant="contained" onClick={handleFindRoute} fullWidth>Get Directions</Button>
        </Paper>
    );
};

export default Directions; 