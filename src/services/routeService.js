import axios from 'axios';

const API_URL = '/directions';

export const getDirections = (origin, destination) => {
    return axios.get(API_URL, {
        params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
        }
    });
}; 