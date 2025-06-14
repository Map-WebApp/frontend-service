import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Box, IconButton, InputAdornment } from '@mui/material';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = ({ open, onClose, onRegisterSuccess, isEmbedded = false, onSuccess = () => {} }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleRegister = async () => {
        if (!username || !password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setError('');
            await axios.post('/api/auth/register', { username, password });
            if (isEmbedded) {
                onSuccess();
            } else {
                onClose();
                onRegisterSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const registerForm = (
        <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                autoFocus
                margin="dense"
                label="Username"
                type="text"
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                margin="dense"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <TextField
                margin="dense"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <Button
                variant="contained"
                fullWidth
                onClick={handleRegister}
                sx={{ mt: 1 }}
            >
                Register
            </Button>
        </>
    );

    if (isEmbedded) {
        return <Box>{registerForm}</Box>;
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Register</DialogTitle>
            <DialogContent>
                {registerForm}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Register; 