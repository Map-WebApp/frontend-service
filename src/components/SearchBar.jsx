import React, { useState } from 'react';
import { Box, TextField, CircularProgress, Typography } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onPlaceSelected }) => {
    const [autocomplete, setAutocomplete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
        // Set Vietnam bounds to prioritize Vietnamese locations
        if (autoC) {
            autoC.setComponentRestrictions({ country: 'vn' });
        }
    };

    const onPlaceChanged = () => {
        setIsLoading(true);
        setError(null);
        
        if (autocomplete !== null) {
            try {
                const place = autocomplete.getPlace();
                
                if (!place.geometry) {
                    setError("No details available for this location. Please select from the dropdown.");
                    setIsLoading(false);
                    return;
                }
                
                onPlaceSelected(place);
            } catch (error) {
                console.error("Error selecting place:", error);
                setError("Error selecting location. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("Search service not loaded yet. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ 
            p: 2,
            position: 'absolute', 
            top: 10, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1, 
            width: { xs: '90%', sm: 400 },
            maxWidth: '95%'
        }}>
            <Box sx={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                borderRadius: 2,
                backgroundColor: 'white'
            }}>
                <SearchIcon sx={{ ml: 2, color: 'text.secondary' }} />
                <Autocomplete 
                    onLoad={onLoad} 
                    onPlaceChanged={onPlaceChanged}
                    options={{ 
                        componentRestrictions: { country: 'vn' },
                        types: ['geocode', 'establishment']
                    }}
                >
                    <TextField 
                        fullWidth
                        variant="outlined"
                        placeholder="Search for a location in Vietnam"
                        sx={{ 
                            '& .MuiOutlinedInput-notchedOutline': { 
                                border: 'none' 
                            }
                        }}
                        InputProps={{
                            endAdornment: isLoading ? <CircularProgress size={20} /> : null
                        }}
                    />
                </Autocomplete>
            </Box>
            
            {error && (
                <Typography 
                    color="error" 
                    variant="caption" 
                    sx={{ 
                        mt: 1, 
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        p: 0.5,
                        borderRadius: 1
                    }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default SearchBar; 