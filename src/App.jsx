import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setIsMobileView } from './store/slices/uiSlice';
import useAuth from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import MapView from './components/map/MapView';
import SearchBox from './components/search/SearchBox';
import SidePanel from './components/panel/SidePanel';
import Toast from './components/ui/Toast';

function App() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const auth = useSelector(state => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isSidePanelOpen } = useSelector(state => state.ui);
  
  useEffect(() => {
    dispatch(setIsMobileView(isMobile));
  }, [isMobile, dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" elevation={1} sx={{ zIndex: 1301 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            DevSecOps Maps
          </Typography>
          {auth.user ? (
            <>
              <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                Xin chào, {auth.user.username || 'User'}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              {/* Các nút Đăng nhập/Đăng ký sẽ được xử lý trong LandingPage */}
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {auth.user ? (
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          height: 'calc(100vh - 64px)' // Trừ chiều cao của AppBar
        }}>
          <SidePanel />
          <Box sx={{ 
            flexGrow: 1, 
            position: 'relative',
            width: isSidePanelOpen && !isMobile ? 'calc(100% - 350px)' : '100%',
            transition: 'width 0.3s ease'
          }}>
            <MapView />
            <SearchBox />
          </Box>
          <Toast />
        </Box>
      ) : (
        <LandingPage />
      )}
    </Box>
  );
}

export default App;
