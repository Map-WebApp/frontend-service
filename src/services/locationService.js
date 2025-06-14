import axios from 'axios';

const API_URL = '/locations';

export const saveLocation = (locationData) => {
    return axios.post(API_URL, locationData);
};

export const getSavedLocations = (username) => {
    return axios.get(`${API_URL}?user=${username}`);
}; 