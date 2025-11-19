import React, { useState, useEffect, useCallback } from 'react'; // <--- Añadir useCallback
import { Container, Title, Paper, TextInput, Select, Button, Loader, Center, Badge, Group, Text, Card, Image } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCrown } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, upgradeToPremium } from '../api/authService';

import logo from '../assets/logos.png'; 

const ProfilePage = () => {
  const { user, globalRefetch } = useAuth(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const [language, setLanguage] = useState('');

  // 1. Usar useCallback para memoizar fetchProfile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setLanguage(data.language_preference);
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo cargar el perfil.', color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []); // Dependencias vacías, solo se crea una vez

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Ejecuta fetchProfile cuando cambie (pero con useCallback, solo lo hará una vez)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Podrías usar otro estado de carga para el submit si quieres
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

  // 2. Usar useCallback para handleUpgrade también
  const handleUpgrade = useCallback(async () => {
    if (!window.confirm("¿Confirmar pago de $0.00 para ser Premium? (Simulación)")) {
      return;
    }

    // Si ya está actualizándose, no hacer nada para evitar dobles clics
    if (isUpgrading) return; 

    setIsUpgrading(true);
    try {
      // Llamamos a la API de simulación
      await upgradeToPremium();
      
      notifications.show({ 
        title: '¡Pago Exitoso!', 
        message: 'Bienvenido al plan Premium. Disfruta de acceso ilimitado.', 
        color: 'green',
        icon: <IconCrown />,
        autoClose: 5000
      });
      
      // Recargamos los datos del perfil para que se vea el cambio "Premium"
      await fetchProfile();
      globalRefetch(); // Avisamos a toda la app que algo cambió

    } catch (err) {
      // SOLO mostrar el error si hubo una falla REAL en la API
      // El problema actual es que el 'success' y 'error' se disparan juntos
      console.error("Error en handleUpgrade:", err);
      notifications.show({ title: 'Error', message: 'No se pudo procesar el pago.', color: 'red' });
    } finally {
      setIsUpgrading(false);
    }
  }, [isUpgrading, fetchProfile, globalRefetch]); // Dependencias para useCallback


  if (loading && !profile) {
    return <Center style={{ height: '80vh' }}><Loader /></Center>;
  }

  const isPremium = profile?.subscription_plan === 'premium';

  return (
    <Container size="sm" mt="lg">
      <Group mb="xl" align="center">
         <Image src={logo} w={60} />
         <Title order={1}>Mi Perfil</Title>
      </Group>
      
      <Card withBorder shadow="sm" radius="md" mb="xl" padding="lg" style={{ borderColor: isPremium ? '#845ef7' : undefined }}>
        <Group justify="space-between" mb="xs">
            <Text fw={700} size="lg">Tu Plan Actual</Text>
            {isPremium ? (
                <Badge size="lg" variant="gradient" gradient={{ from: 'violet', to: 'blue' }} leftSection={<IconCrown size={14} />}>PREMIUM</Badge>
            ) : (
                <Badge size="lg" color="gray">GRATIS</Badge>
            )}
        </Group>

        <Text c="dimmed" size="sm" mb="md">
            {isPremium 
                ? "¡Tienes acceso ilimitado a todas las funciones de IA y almacenamiento!" 
                : "Estás usando el plan gratuito con límites de almacenamiento y consultas."}
        </Text>
        
        {!isPremium && (
            <Button 
                onClick={handleUpgrade} 
                loading={isUpgrading}
                variant="gradient" 
                gradient={{ from: 'orange', to: 'red' }}
                fullWidth
                leftSection={<IconCrown size={18} />}
                // 3. Desactivar el botón completamente mientras se está actualizando
                disabled={isUpgrading} 
            >
                Mejorar a Premium (Simular Pago)
            </Button>
        )}
      </Card>


      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
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

          <Select
            label="Idioma de Preferencia"
            value={language}
            onChange={setLanguage}
            data={[
              { value: 'en', label: 'Inglés' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Francés' },
              { value: 'de', label: 'Alemán' },
              { value: 'pt', label: 'Portugués' },
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