import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // La URL de tu backend Django
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = localStorage.getItem('authToken');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
}

export default apiClient;