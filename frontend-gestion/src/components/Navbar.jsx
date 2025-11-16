import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importar el hook
import { Group, Button, Text, Anchor, Box } from '@mantine/core';

const Navbar = () => {
  // 2. Obtener 'isAuthenticated', 'user' y 'logout' del contexto
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Box h="100%" px="md" bg="rgba(42, 43, 53, 1)">
      <Group justify="space-between" h="100%">
        <Anchor component={Link} to="/" fw={700} c="rgba(255, 255, 255, 1)" td="none" size="lg">
          Gestor de Documentos
        </Anchor>

        <Group>
          {isAuthenticated ? (
            // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
            // 3. Renderizar el nombre del usuario si existe
            <>
              <Text c="rgba(255, 255, 255, 1)" td="none">
                Hola, {user ? user.username : 'Usuario'}
              </Text>
              <Button color="red" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            // Si NO está autenticado
            <Group>
              <Button component={Link} to="/login" variant="default">
                Iniciar Sesión
              </Button>
              <Button component={Link} to="/register" variant="outline">
                Registrarse
              </Button>
            </Group>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default Navbar;