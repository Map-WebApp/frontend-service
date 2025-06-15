import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Rating, Chip, Divider, Paper, Grid, IconButton, Tabs, Tab, Link } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import WebIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsIcon from '@mui/icons-material/Directions';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReviewsIcon from '@mui/icons-material/Reviews';

import useMapFunctions from '../../hooks/map/useMapFunctions';
import { motion } from 'framer-motion';

const ActionButton = ({ icon, label, onClick }) => (
    <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        onClick={onClick}
        sx={{ cursor: 'pointer', color: 'primary.main', minWidth: 65 }}
    >
        {icon}
        <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 'medium' }}>{label.toUpperCase()}</Typography>
    </Box>
);

const PlaceInfo = () => {
    const selectedPlace = useSelector(state => state.map.selectedPlace);
    const { handleSaveLocation, handleDirectionsFromUserLocation } = useMapFunctions();
    const [photoIndex, setPhotoIndex] = useState(0);
    const dispatch = useDispatch();

    // Reset photo index when place changes
    useEffect(() => {
        if (selectedPlace) {
            console.log('Selected place in PlaceInfo:', selectedPlace);
            setPhotoIndex(0);
        }
    }, [selectedPlace]);

    if (!selectedPlace) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <CategoryIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6">Chưa có địa điểm nào được chọn</Typography>
                <Typography>Hãy tìm kiếm hoặc chọn một điểm trên bản đồ để xem chi tiết.</Typography>
            </Box>
        );
    }
    
    // Extract all required fields with fallbacks
    const { 
        name = "Không có tên",
        address = selectedPlace.formatted_address || "Không có địa chỉ", 
        rating = 0, 
        user_ratings_total = 0, 
        photoUrls = [], 
        types = [], 
        phoneNumber = selectedPlace.formatted_phone_number || selectedPlace.international_phone_number || "", 
        website = "", 
        is_open_now = selectedPlace.opening_hours?.isOpen?.() || selectedPlace.opening_hours?.open_now || false,
        reviews = []
    } = selectedPlace;
    
    const hasPhotos = photoUrls && Array.isArray(photoUrls) && photoUrls.length > 0;
    const photoUrl = hasPhotos && photoIndex < photoUrls.length 
        ? photoUrls[photoIndex]
        : 'https://maps.gstatic.com/tactile/pane/default_geocode-1x.png';
    
    const handleNextPhoto = () => hasPhotos && setPhotoIndex((photoIndex + 1) % photoUrls.length);
    const handlePrevPhoto = () => hasPhotos && setPhotoIndex((photoIndex - 1 + photoUrls.length) % photoUrls.length);
    
    const mainType = types && Array.isArray(types) && types.length > 0
        ? types[0].replace(/_/g, ' ')
        : 'Địa điểm';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Box sx={{ height: 220, position: 'relative', overflow: 'hidden', bgcolor: '#e0e0e0' }}>
                <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {hasPhotos && photoUrls.length > 1 && (
                    <>
                        <IconButton onClick={handlePrevPhoto} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0, 0, 0, 0.4)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }, color: 'white' }}>
                            <ArrowBackIosNewIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={handleNextPhoto} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0, 0, 0, 0.4)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }, color: 'white' }}>
                            <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                        <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1.5, py: 0.5, borderRadius: '16px', fontSize: '0.8rem' }}>
                            {photoIndex + 1} / {photoUrls.length}
                        </Box>
                    </>
                )}
            </Box>

            <Box sx={{ p: 2 }}>
                <Typography variant="h5" fontWeight="bold">{name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>{rating?.toFixed(1) || "0.0"}</Typography>
                    <Rating value={rating || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({user_ratings_total || 0})</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{mainType}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2, py: 1, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <ActionButton icon={<DirectionsIcon />} label="Chỉ đường" onClick={() => handleDirectionsFromUserLocation(selectedPlace)} />
                    <ActionButton icon={<BookmarkAddIcon />} label="Lưu" onClick={handleSaveLocation} />
                    <ActionButton icon={<ShareIcon />} label="Chia sẻ" onClick={() => navigator.clipboard.writeText(window.location.href)} />
                </Box>
                
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                    {typeof is_open_now !== 'undefined' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AccessTimeIcon color={is_open_now ? 'success' : 'error'} sx={{ mr: 1.5 }} />
                            <Typography variant="body1" sx={{ color: is_open_now ? 'green' : 'red', fontWeight: 'medium' }}>
                                {is_open_now ? 'Đang mở cửa' : 'Đang đóng cửa'}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <LocationOnIcon color="action" sx={{ mr: 1.5, mt: 0.3 }} />
                        <Typography variant="body1">{address}</Typography>
                    </Box>
                    {phoneNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PhoneIcon color="action" sx={{ mr: 1.5 }} />
                            <Link href={`tel:${phoneNumber}`} variant="body1">{phoneNumber}</Link>
                        </Box>
                    )}
                    {website && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WebIcon color="action" sx={{ mr: 1.5 }} />
                            <Link href={website} target="_blank" rel="noopener noreferrer" variant="body1" sx={{ wordBreak: 'break-all' }}>{website}</Link>
                        </Box>
                    )}
                </Paper>
                
                {reviews && Array.isArray(reviews) && reviews.length > 0 && (
                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Đánh giá</Typography>
                        {reviews.slice(0, 2).map((review, index) => (
                            <Box key={review.time || index} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <ReviewsIcon color="action" sx={{ mr: 1 }} />
                                    <Typography variant="subtitle2" fontWeight="bold">{review.author_name || "Anonymous"}</Typography>
                                    <Rating value={review.rating || 0} readOnly size="small" sx={{ ml: 'auto' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">{review.relative_time_description || ""}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>{review.text || ""}</Typography>
                            </Box>
                        ))}
                    </Paper>
                )}
            </Box>
        </motion.div>
    );
};

export default PlaceInfo; 