import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Button, Typography, CircularProgress, Paper, Fab, Drawer, IconButton, Divider, List, ListItem, ListItemText, ListItemIcon, Tooltip } from '@mui/material';
import useAuth from '../hooks/useAuth';
import SearchBar from './SearchBar';
import Directions from './Directions';
import { saveLocation, getSavedLocations } from '../services/locationService';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';

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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const { user } = useAuth();

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        setMap(map);
        setMapLoaded(true);
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
                name: place.name || place.formatted_address || "Selected Location",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address || "",
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
    
    const handleGetUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        name: "Your Location"
                    };
                    setUserLocation(userPos);
                    if (map) {
                        map.panTo(userPos);
                        map.setZoom(15);
                    }
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    alert("Unable to retrieve your location. Please check your browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleLocationSelect = (location) => {
        if (map) {
            map.panTo({ lat: location.lat, lng: location.lng });
            map.setZoom(15);
            setSelectedPlace(location);
            setDrawerOpen(false);
        }
    };
    
    if (loadError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                <Typography variant="h6" color="error">Error loading maps</Typography>
                <Typography variant="body2">Please check your internet connection and API key.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {isLoaded ? (
                <>
                    <SearchBar onPlaceSelected={handlePlaceSelect} />
                    
                    <Fab 
                        color="primary" 
                        aria-label="menu"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2 }}
                    >
                        <MenuIcon />
                    </Fab>
                    
                    <Fab 
                        color="secondary" 
                        aria-label="my-location"
                        onClick={handleGetUserLocation}
                        sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}
                    >
                        <MyLocationIcon />
                    </Fab>
                    
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={13}
                        onLoad={onMapLoad}
                        options={{
                            fullscreenControl: false,
                            streetViewControl: true,
                            mapTypeControl: true,
                            zoomControl: true,
                        }}
                    >
                        {/* User's current location marker */}
                        {userLocation && (
                            <Marker
                                position={{ lat: userLocation.lat, lng: userLocation.lng }}
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                animation={window.google.maps.Animation.BOUNCE}
                                onClick={() => setSelectedPlace(userLocation)}
                            />
                        )}
                        
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
                                        <Box sx={{ p: 1, maxWidth: 250 }}>
                                            <Typography variant="h6">{selectedPlace.name}</Typography>
                                            {selectedPlace.address && (
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    {selectedPlace.address}
                                                </Typography>
                                            )}
                                            {user && (
                                                <Button 
                                                    onClick={handleSaveLocation} 
                                                    size="small" 
                                                    variant="contained"
                                                    startIcon={<StarIcon />}
                                                >
                                                    Save Location
                                                </Button>
                                            )}
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
                                onClick={() => setSelectedPlace(loc)}
                            />
                        ))}

                        {/* Directions renderer */}
                        {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                    
                    {isLoaded && <Directions onDirectionsFound={setDirections} />}
                    
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        <Box sx={{ width: 320 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>Saved Locations</Typography>
                                <IconButton onClick={() => setDrawerOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Divider />
                            <List>
                                {savedLocations.length > 0 ? (
                                    savedLocations.map((location) => (
                                        <ListItem 
                                            key={location._id} 
                                            button 
                                            onClick={() => handleLocationSelect(location)}
                                        >
                                            <ListItemIcon>
                                                <StarIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={location.name} 
                                                secondary={location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`} 
                                            />
                                            <Tooltip title="Remove">
                                                <IconButton edge="end">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No saved locations yet"
                                            secondary="Search for a place and save it to see it here"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    </Drawer>
                    
                </>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%', 
                    flexDirection: 'column',
                    backgroundColor: '#f5f5f5'
                }}>
                    <CircularProgress size={48} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Loading Maps...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(Map); 