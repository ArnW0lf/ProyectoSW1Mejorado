// authService.js (Forzando el header como prueba)
import apiClient from "./axiosConfig";

// Función de Login (con header forzado)
export const login = async (username, password) => {
    const data = {
        username,
        password,
    };

    // Opciones de configuración para esta llamada específica
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Pasamos la data y la configuración
    const response = await apiClient.post('/auth/login/', data, config);
    
    if (response.data.key) {
        localStorage.setItem('authToken', response.data.key);
    }
    return response.data;
};

// --- El resto de tus funciones (register, logout) ---

// UC-01: Registro
export const register = async (username, email, password, password2) => {
    const response = await apiClient.post('/auth/register/', {
        username,
        email,
        password: password,
        password2,
    });
    return response.data;
};

// UC-03: Cierre de sesión
export const logout = async () => {
  const token = localStorage.getItem('authToken');
  await apiClient.post('/auth/logout/', null, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  localStorage.removeItem('authToken');
};

/**
 * UC-06: Ver datos de usuario
 * Obtiene los datos del usuario autenticado.
 */
export const getUser = async () => {
    try {
        // apiClient ya tiene el token inyectado por AuthContext
        const response = await apiClient.get('/auth/user/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        throw error;
    }
};