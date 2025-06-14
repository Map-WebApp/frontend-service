import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import useAuth from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Map from './components/Map';

function App() {
    const { user, logout } = useAuth();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        DevSecOps Maps
                    </Typography>
                    {user && (
                        <>
                            <Typography sx={{ mr: 2 }}>Welcome, {user.username}</Typography>
                            <Button color="inherit" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            
            {user ? (
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                    <Map />
                </Box>
            ) : (
                <LandingPage />
            )}
        </Box>
    );
}

export default App;
