import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import useAuth from './hooks/useAuth';
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';

function App() {
    const { user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        DevSecOps Maps
                    </Typography>
                    {user ? (
                        <>
                            <Typography sx={{ mr: 2 }}>Welcome, {user.username}</Typography>
                            <Button color="inherit" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => setLoginOpen(true)}>
                                Login
                            </Button>
                            <Button color="inherit" onClick={() => setRegisterOpen(true)}>
                                Register
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
            <Register open={registerOpen} onClose={() => setRegisterOpen(false)} onRegisterSuccess={() => setLoginOpen(true)}/>
            
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Map />
            </Box>
        </Box>
    );
}

export default App;
