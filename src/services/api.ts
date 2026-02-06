import axios from 'axios';

const API_URL = 'https://java-quiz-master-20bx.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
});

export const uploadPdf = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const createSession = async () => {
    const response = await api.post('/sessions', { hostId: 'host' }); // hostId can be improved
    return response.data;
};

export const saveSessionQuestions = async (sessionId: string, questions: any[]) => {
    const response = await api.post(`/sessions/${sessionId}/questions`, { sessionId, questions });
    return response.data;
};

export const getSession = async (sessionId: string) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
};

export default api;
