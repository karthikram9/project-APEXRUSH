import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const submitPrediction = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error("Prediction API Error:", error);
        throw error;
    }
};

export const submitDietPlan = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/diet`, data);
        return response.data;
    } catch (error) {
        console.error("Diet API Error:", error);
        throw error;
    }
};
