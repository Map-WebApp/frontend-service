import React, { useEffect } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Component Toast dùng để hiển thị các thông báo
const Toast = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector(state => state.ui);

  const handleClose = (id) => {
    dispatch(removeToast(id));
  };

  // Tự động đóng toast sau 5 giây
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toasts[0].id));
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [toasts, dispatch]);

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 24, 
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 2000,
      width: { xs: '90%', sm: 'auto' },
      maxWidth: 400,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Snackbar
              open={true}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              sx={{ position: 'static', mb: 1 }}
            >
              <Alert 
                onClose={() => handleClose(toast.id)} 
                severity={toast.type || 'info'}
                variant="filled"
                sx={{ width: '100%', boxShadow: 2 }}
              >
                {toast.message}
              </Alert>
            </Snackbar>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default Toast; 