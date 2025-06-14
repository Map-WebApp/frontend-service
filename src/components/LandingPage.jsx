import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import Login from './Login';
import Register from './Register';

const LandingPage = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(32,124,229,1) 0%, rgba(73,155,234,1) 55%, rgba(32,200,242,1) 100%)',
                backgroundSize: 'cover',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0.5,
                    zIndex: 1,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                        animation: 'backgroundAnimation 60s linear infinite',
                    },
                }}
            />

            <Paper
                elevation={10}
                sx={{
                    width: { xs: '90%', sm: '450px' },
                    borderRadius: 2,
                    overflow: 'hidden',
                    zIndex: 2,
                }}
            >
                <Box sx={{ p: 4, pb: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        DevSecOps Maps
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        Your secure mapping solution
                    </Typography>
                </Box>

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ mb: 2 }}
                >
                    <Tab label="Login" />
                    <Tab label="Register" />
                </Tabs>
                
                <Box sx={{ p: 3, pt: 0 }}>
                    {tabValue === 0 && <Login isEmbedded={true} onSuccess={() => {}} />}
                    {tabValue === 1 && <Register isEmbedded={true} onSuccess={() => setTabValue(0)} />}
                </Box>
            </Paper>
            
            <style jsx global>{`
                @keyframes backgroundAnimation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );
};

export default LandingPage; 