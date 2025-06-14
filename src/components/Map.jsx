import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import useAuth from '../hooks/useAuth';
import SearchBar from './SearchBar';
import Directions from './Directions';
import { saveLocation, getSavedLocations } from '../services/locationService';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 10.776530,
  lng: 106.700981 // Ho Chi Minh City
};

const Map = () => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    });

    const [map, setMap] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [savedLocations, setSavedLocations] = useState([]);
    const [directions, setDirections] = useState(null);
    const { user } = useAuth();

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        setMap(map);
    }, []);

    const fetchSavedLocations = useCallback(async () => {
        if (user) {
            try {
                const response = await getSavedLocations(user.username);
                setSavedLocations(response.data);
            } catch (error) {
                console.error("Failed to fetch saved locations:", error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchSavedLocations();
    }, [fetchSavedLocations]);

    const handlePlaceSelect = (place) => {
        if (place.geometry && place.geometry.location) {
            const newPlace = {
                name: place.name,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setSelectedPlace(newPlace);
            map.panTo(newPlace);
            map.setZoom(15);
        }
    };
    
    const handleSaveLocation = async () => {
        if (!selectedPlace || !user) return;
        try {
            const locationData = { ...selectedPlace, user: user.username };
            await saveLocation(locationData);
            fetchSavedLocations(); // Refresh saved locations
            setSelectedPlace(null); // Close info window
        } catch (error) {
            console.error("Failed to save location:", error);
        }
    };
    
    if (loadError) {
        return <Typography>Error loading maps</Typography>;
    }

    return isLoaded ? (
        <>
            <SearchBar onPlaceSelected={handlePlaceSelect} />
            {isLoaded && <Directions onDirectionsFound={setDirections} />}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onMapLoad}
            >
                {/* Marker for the currently selected place */}
                {selectedPlace && (
                    <Marker 
                        position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                        onClick={() => setSelectedPlace(selectedPlace)} 
                    >
                        {selectedPlace && (
                            <InfoWindow
                                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                                onCloseClick={() => setSelectedPlace(null)}
                            >
                                <Box sx={{ p: 1 }}>
                                    <Typography variant="h6">{selectedPlace.name}</Typography>
                                    {user && <Button onClick={handleSaveLocation} size="small">Save to Favorites</Button>}
                                </Box>
                            </InfoWindow>
                        )}
                    </Marker>
                )}

                {/* Markers for saved locations */}
                {savedLocations.map((loc) => (
                    <Marker
                        key={loc._id}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        }}
                    />
                ))}

                {/* Directions a-b */}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </>
    ) : <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
};

export default React.memo(Map); 