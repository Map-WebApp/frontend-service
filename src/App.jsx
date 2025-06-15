import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Cập nhật trạng thái responsive
  useEffect(() => {
    dispatch(setIsMobileView(isMobile));
  }, [isMobile, dispatch]);
  
  // Xử lý sự kiện resize cửa sổ
  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobileView(window.innerWidth < 768));
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Maps WebApp
          </Typography>
          {user ? (
            <>
              <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                Xin chào, {user.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit">Đăng nhập</Button>
              <Button color="inherit">Đăng ký</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {user ? (
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <MapView />
          <SearchBox />
          <SidePanel />
          <Toast />
        </Box>
      ) : (
        <LandingPage />
      )}
    </Box>
  );
}

export default App;
