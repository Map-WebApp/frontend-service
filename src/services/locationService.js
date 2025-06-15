import axios from 'axios';

const API_URL = 'http://localhost:3003';

// Lấy danh sách địa điểm đã lưu của người dùng
export const getSavedLocations = async (username) => {
  try {
    return await axios.get(`${API_URL}/locations?user=${username}`);
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    throw error;
  }
};

// Lưu một địa điểm mới
export const saveLocation = async (locationData) => {
  try {
    return await axios.post(`${API_URL}/locations`, locationData);
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
};

// Xóa một địa điểm đã lưu
export const deleteLocation = async (locationId) => {
  try {
    return await axios.delete(`${API_URL}/locations/${locationId}`);
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

// Cập nhật thông tin địa điểm
export const updateLocation = async (locationId, locationData) => {
  try {
    return await axios.put(`${API_URL}/locations/${locationId}`, locationData);
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}; 