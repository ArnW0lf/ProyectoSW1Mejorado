import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/authService';
import apiClient from '../api/axiosConfig';

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // Opcional: para guardar datos del usuario

  useEffect(() => {
    if (authToken) {
      // Configura el encabezado de autorización para todas las futuras peticiones de axios
      apiClient.defaults.headers.common['Authorization'] = `Token ${authToken}`;
      // Opcional: podrías hacer una petición aquí para obtener los datos del usuario
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [authToken]);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setAuthToken(data.key);
    localStorage.setItem('authToken', data.key);
  };

  const register = async (username, email, password, password2) => {
    // La función de registro del backend no devuelve un token,
    // solo un mensaje de éxito. El usuario debe iniciar sesión después.
    await apiRegister(username, email, password, password2);
  };

  const logout = async () => {
    await apiLogout();
    setAuthToken(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    authToken,
    user,
    login,
    logout,
    register,
    isAuthenticated: !!authToken, // Un booleano para verificar fácilmente si está autenticado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Crear un Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};