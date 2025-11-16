import React, { useState } from 'react';
import { Title, Box, Group, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import DocumentList from '../components/DocumentList';
import UploadButton from '../components/UploadButton';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // 1. Estado "trigger" para forzar la recarga de DocumentList
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { selectedFolderId, selectedTagId } = useAuth();

  const refetchData = () => {
    setRefetchTrigger((count) => count + 1);
  };


  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={1}>Mis Documentos</Title>
        {/* 3. Pasar la función de éxito al botón */}
        <UploadButton onUploadSuccess={refetchData} />
      </Group>

      <TextInput
        placeholder="Buscar en mis documentos..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="lg"
      />

      {/* 4. Pasar el trigger a la lista */}
      <DocumentList
        searchQuery={searchQuery}
        refetchTrigger={refetchTrigger}
        onDataChange={refetchData}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
      />
    </Box>
  );
};

export default HomePage;