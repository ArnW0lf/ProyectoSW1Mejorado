import React, { useState, useEffect } from 'react';
import { Container, Title, Paper, TextInput, Select, Button, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/authService';

const ProfilePage = () => {
  const { user } = useAuth(); // Obtener el usuario base del contexto
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [language, setLanguage] = useState('');

  // Cargar el perfil al montar la página
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setLanguage(data.language_preference); // Llenar el formulario
      } catch (err) {
        notifications.show({ title: 'Error', message: 'No se pudo cargar el perfil.', color: 'red' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Manejador para guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { language_preference: language };
      await updateProfile(updatedData);
      notifications.show({ title: 'Éxito', message: 'Perfil actualizado.', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el perfil.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <Center style={{ height: '80vh' }}><Loader /></Center>;
  }

  return (
    <Container size="sm" mt="lg">
      <Title order={1} mb="xl">Mi Perfil</Title>
      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          {/* Mostramos el 'user' del AuthContext (no editable aquí) */}
          <TextInput
            label="Username"
            value={user?.username || ''}
            disabled
          />
          <TextInput
            label="Email"
            value={user?.email || ''}
            disabled
            mt="md"
          />
          
          {/* Mostramos el 'profile' de la API (editable) */}
          <Select
            label="Idioma de Preferencia"
            value={language}
            onChange={setLanguage}
            data={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'Inglés' },
            ]}
            mt="md"
            disabled={loading}
          />

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Guardar Cambios
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;