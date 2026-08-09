// authService.js (FINALMENTE CORREGIDO para DJOSER y COMPATIBILIDAD)
import apiClient from "./axiosConfig";

// Función de Login 
export const login = async (username, password) => {
    const data = {
        username,
        password,
    };

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // 💥 CORRECCIÓN URL: /auth/login/ -> /token/login/
    const response = await apiClient.post('/token/login/', data, config); 
    
    // 💥 CORRECCIÓN TOKEN: Djoser devuelve 'auth_token', no 'key'
    if (response.data.auth_token) { 
        localStorage.setItem('authToken', response.data.auth_token);
    }
    return response.data;
};

// UC-01: Registro
export const register = async (username, email, password1, password2) => {
    // 💥 CORRECCIÓN URL: /auth/register/ -> /users/
    // 💥 PAYLOAD COMPATIBLE: Mantenemos 'password1' y 'password2' para el Backend
    const response = await apiClient.post('/users/', {
        username,
        email,
        password: password1, // El Serializer de Djoser espera 'password'
        re_password: password2, // El Serializer de Djoser espera 're_password'
    });
    return response.data;
};

// UC-03: Cierre de sesión
export const logout = async () => {
  // 💥 CORRECCIÓN URL: /auth/logout/ -> /token/logout/
  await apiClient.post('/token/logout/');
};

/**
 * UC-06: Ver datos de usuario
 */
export const getUser = async () => {
    try {
        // 💥 CORRECCIÓN URL: /auth/user/ -> /users/me/
        const response = await apiClient.get('/users/me/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        throw error;
    }
};

/**
 * UC-07/08: Obtiene y Actualiza el perfil extendido del usuario.
 * Nota: Asumo que /profile/ es una ruta personalizada y se mantiene.
 */
export const getProfile = async () => {
    try {
        const response = await apiClient.get('/profile/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await apiClient.patch('/profile/', profileData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
    }
};

/**
 * UC-04: Solicitar reseteo de contraseña.
 */
export const requestPasswordReset = async (email) => {
    try {
        // 💥 CORRECCIÓN URL: /auth/password/reset/ -> /users/reset_password/
        const response = await apiClient.post('/users/reset_password/', { email });
        return response.data;
    } catch (error) {
        console.error('Error al solicitar reseteo de contraseña:', error);
        throw error;
    }
};

/**
 * UC-04: Confirmar nueva contraseña.
 */
export const confirmPasswordReset = async (new_password1, new_password2, uid, token) => {
    try {
        // 💥 CORRECCIÓN URL: /auth/password/reset/confirm/ -> /users/reset_password_confirm/
        // Mapeo de campos a lo que Djoser espera:
        const response = await apiClient.post('/users/reset_password_confirm/', {
            new_password: new_password1, // Djoser espera 'new_password'
            re_new_password: new_password2, // Djoser espera 're_new_password'
            uid,
            token,
        });
        return response.data;
    } catch (error) {
        console.error('Error al confirmar la nueva contraseña:', error);
        throw error;
    }
};

/**
 * SIMULACIÓN DE PAGO:
 */
export const upgradeToPremium = async () => {
    try {
        const response = await apiClient.post('/upgrade-premium/');
        return response.data;
    } catch (error) {
        console.error('Error al procesar el pago simulado:', error);
        throw error;
    }
};