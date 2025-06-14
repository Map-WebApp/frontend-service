import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';

const SearchBar = ({ onPlaceSelected }) => {
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            onPlaceSelected(autocomplete.getPlace());
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    return (
        <Box sx={{ p: 2, position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1, width: 400 }}>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <TextField 
                    fullWidth
                    variant="outlined"
                    placeholder="Search for a location"
                    sx={{ backgroundColor: 'white' }}
                />
            </Autocomplete>
        </Box>
    );
};

export default SearchBar; 