import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Center,
  Container,
} from '@mantine/core';
// 1. Importar el hook de notificaciones
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Enviando al backend:', { username, password });
    try {
      await login(username, password);
      // ¡No mostramos notificación de éxito aquí, AuthContext lo hará!
      navigate('/');
    } catch (err) {
      // 3. Mostrar notificación de error
      notifications.show({
        title: 'Error al iniciar sesión',
        message: 'Por favor, revisa tu usuario y contraseña.',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      console.error(err);
    }
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
          <Title order={2} ta="center" mb="lg">
            Iniciar Sesión
          </Title>
          
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mt="md"
            />

            {/* 4. Ya no necesitamos el componente Notification aquí */}

            <Button fullWidth mt="xl" type="submit">
              Ingresar
            </Button>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            ¿No tienes una cuenta?{' '}
            <Anchor component={Link} to="/register" size="sm">
              Registrarse aquí
            </Anchor>
          </Text>
        </Paper>
      </Center>
    </Container>
  );
};

export default LoginPage;