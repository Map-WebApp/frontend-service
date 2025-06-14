import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a more modern theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#4791db',
            dark: '#115293',
        },
        secondary: {
            main: '#dc004e',
            light: '#e33371',
            dark: '#9a0036',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

// Render the app with the new theme
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden;
                }
                #root {
                    height: 100vh;
                }
            `}</style>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);
