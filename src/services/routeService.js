import axios from 'axios';

const API_URL = 'http://localhost:3004';

// Lấy chỉ đường giữa hai điểm
export const getDirections = async (origin, destination, travelMode = 'DRIVING') => {
  try {
    const response = await axios.get(`${API_URL}/directions`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: travelMode.toLowerCase()
      }
    });
    return response;
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};

// Tìm kiếm địa điểm gần đó
export const getNearbyPlaces = async (location, radius = 1000, type = '') => {
  try {
    const response = await axios.get(`${API_URL}/places/nearby`, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius,
        type
      }
    });
    return response;
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết về một địa điểm
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(`${API_URL}/places/details`, {
      params: { place_id: placeId }
    });
    return response;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}; 