import React, { useState, useEffect } from 'react';
// 1. Agregamos 'Image' a los imports de Mantine
import { Title, Box, Group, TextInput, Button, Image } from '@mantine/core';
import { IconSearch, IconSparkles } from '@tabler/icons-react';
import DocumentList from '../components/DocumentList';
import UploadButton from '../components/UploadButton';
import AIAssistantModal from '../components/AIAssistantModal';
import { useAuth } from '../context/AuthContext';
import WebSocketInstance from '../api/socketService'; 

// 2. Importamos el logo (asegúrate de que el archivo exista en esta ruta)
import logo from '../assets/logos.png';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModalOpened, setAiModalOpened] = useState(false);
  
  const { selectedFolderId, selectedTagId, globalRefetch, globalRefetchTrigger } = useAuth();
  
  const refetchData = () => {
    globalRefetch();
  };

  return (
    <Box>
      {/* 3. Modificamos el Group del encabezado para incluir el Logo */}
      <Group justify="space-between" mb="xl" align="center">
        <Group gap="xs">
           {/* Aquí va el Logo junto al Título */}
           <Image 
             src={logo} 
             alt="Lingua-Sync AI" 
             w={50} 
             h={50} 
             fit="contain" 
           />
           <Title order={1}>Mis Documentos</Title>
        </Group>

        <Group>
          <Button 
            leftSection={<IconSparkles size={14} />}
            onClick={() => setAiModalOpened(true)}
            variant="gradient"
            gradient={{ from: 'violet', to: 'blue', deg: 90 }}
          >
            Asistente IA
          </Button>
          <UploadButton onUploadSuccess={refetchData} />
        </Group>
      </Group>

      <TextInput
        placeholder="Buscar en mis documentos..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="lg"
      />

      <DocumentList
        searchQuery={searchQuery}
        refetchTrigger={globalRefetchTrigger} 
        onDataChange={refetchData}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
      />

      <AIAssistantModal
        opened={aiModalOpened}
        onClose={() => setAiModalOpened(false)}
        onSuccess={refetchData}
      />
    </Box>
  );
};

export default HomePage;