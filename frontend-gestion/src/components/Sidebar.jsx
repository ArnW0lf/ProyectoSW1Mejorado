import React from 'react';
import { Box, Title } from '@mantine/core';
import FolderTree from './FolderTree';
import TagList from './TagList'; // 1. Importar el nuevo componente

const Sidebar = () => {
  return (
    <Box>
      <Title order={4} mb="sm">
        Carpetas
      </Title>
      <FolderTree />

      {/* 2. Reemplazar el Box placeholder con el componente real */}
      <Title order={4} mt="xl" mb="sm">
        Etiquetas
      </Title>
      <TagList />
      
    </Box>
  );
};

export default Sidebar;