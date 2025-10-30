import apiClient from "./axiosConfig";


// UC-01: Registro de nuevo usuario
export const register = async (username, email, password, password2) => {
    const response = await apiClient.post('/auth/register/', {
        username,
        email,
        password1: password,
        password2, // dj-rest-auth requiere confirmación
    });
    return response.data;
};

// UC-02: Inicio de sesión
export const login = async (username, password) => {
    const response = await apiClient.post('/auth/login/', {
        username,
        password,
    });
    // Guardamos el token en el almacenamiento local
    if (response.data.key) {
        localStorage.setItem('authToken', response.data.key);
    }
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
  // Removemos el token del almacenamiento local
  localStorage.removeItem('authToken');
};