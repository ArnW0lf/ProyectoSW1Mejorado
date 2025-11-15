import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Group, Button, Text, Anchor, Box } from '@mantine/core';

const Navbar = () => {
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
    // Usamos un Box para el padding y el 100% de altura
    <Box h="100%" px="md">
      {/* Group es un componente de Mantine para alinear elementos */}
      <Group justify="space-between" h="100%">
        {/* 1. Nombre del Sistema */}
        <Anchor component={Link} to="/" fw={700} c="white" td="none" size="lg">
          Gestor de Documentos
        </Anchor>
        
        {/* 2. Nombre de Usuario y Botón de Logout */}
        <Group>
          {isAuthenticated ? (
            // Si está autenticado
            <>
              <Text c="white">Hola, {user ? user.username : 'Usuario'}</Text>
              <Button color="red" onClick={handleLogout} >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            // Si NO está autenticado
            <Group>
              <Button component={Link} to="/login" variant="default" >
                Iniciar Sesión
              </Button>
              <Button component={Link} to="/register" variant="outline" >
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