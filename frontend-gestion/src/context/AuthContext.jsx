import React, { createContext, useState, useContext, useEffect } from 'react';
// 1. Importar la nueva función
import { login as apiLogin, logout as apiLogout, register as apiRegister, getUser } from '../api/authService';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // <-- Este estado ahora se llenará
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (authToken) {
        apiClient.defaults.headers.common['Authorization'] = `Token ${authToken}`;
        try {
          // 2. ¡Llamar a la API para obtener los datos del usuario!
          const userData = await getUser();
          setUser(userData); // 3. Guardar el usuario en el estado
        } catch (e) {
          // Si el token es inválido (ej. expiró), cerramos sesión
          setAuthToken(null);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };
    loadUser();
  }, [authToken]); // Se ejecuta cada vez que el token cambia

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    const token = data.key;
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    // 4. Obtener datos del usuario INMEDIATAMENTE después de iniciar sesión
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (e) {
      console.error("Error al obtener el usuario después de iniciar sesión", e);
    }
    
    setAuthToken(token);
  };

  const logout = async () => {
    await apiLogout();
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setUser(null); // 5. Limpiar el usuario al cerrar sesión
  };

  const value = {
    authToken,
    user, // <-- 'user' ahora tendrá datos
    login,
    logout,
    loading,
    register: apiRegister,
    isAuthenticated: !!authToken,
    selectedFolderId,
    setSelectedFolderId,
    selectedTagId,
    setSelectedTagId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};