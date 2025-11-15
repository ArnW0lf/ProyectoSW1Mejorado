import React, { useState } from 'react';
import { Title, Box, Group, Button, TextInput } from '@mantine/core';
import { IconUpload, IconSearch } from '@tabler/icons-react';
import DocumentList from '../components/DocumentList'; 

const HomePage = () => {
  // 1. Estado para guardar el valor de la búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Box>
      {/* --- Encabezado --- */}
      <Group justify="space-between" mb="xl">
        <Title order={1}>Mis Documentos</Title>
        <Button leftSection={<IconUpload size={14} />}>
          Subir Documento
        </Button>
      </Group>

      {/* --- Barra de Búsqueda --- */}
      <TextInput
        placeholder="Buscar en mis documentos..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="lg" // Margen inferior para separarlo de la lista
      />

      {/* --- Lista de Documentos --- */}
      {/* 2. Pasamos la búsqueda al componente DocumentList */}
      <DocumentList searchQuery={searchQuery} />
      
    </Box>
  );
};

export default HomePage;