import React, { useState } from 'react';
import { Box, Title, Group, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import FolderTree from './FolderTree';
import TagList from './TagList';
import { useAuth } from '../context/AuthContext';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';

const Sidebar = () => {
  // --- INICIO DE LA MODIFICACIÓN ---
  // 1. Obtenemos el trigger global y la función de refresco
  const { setSelectedFolderId, globalRefetch, globalRefetchTrigger } = useAuth();
  
  // 2. Ya no necesitamos los triggers locales
  // const [refetchFolders, setRefetchFolders] = useState(0);
  // const [refetchTags, setRefetchTags] = useState(0);
  // --- FIN DE LA MODIFICACIÓN ---
  
  const [folderModalOpened, setFolderModalOpened] = useState(false);
  const [tagModalOpened, setTagModalOpened] = useState(false);

  // 3. Hacemos que los modales de la sidebar también usen el refresco global
  const handleFolderSuccess = () => {
    globalRefetch(); // Llama al refresco global
    setFolderModalOpened(false);
  };

  const handleTagSuccess = () => {
    globalRefetch(); // Llama al refresco global
    setTagModalOpened(false); 
  };
  
  return (
    <>
      <Group justify="space-between" mb="sm">
        <Title order={4}>Carpetas</Title>
        <ActionIcon size="sm" variant="default" onClick={() => setFolderModalOpened(true)}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      
      <FolderTree 
        onFolderSelect={setSelectedFolderId} 
        // 4. Pasamos el trigger GLOBAL a FolderTree
        refetchTrigger={globalRefetchTrigger}
        onRefetch={handleFolderSuccess}
      />

      <Group justify="space-between" mt="xl" mb="sm">
        <Title order={4}>Etiquetas</Title>
        <ActionIcon size="sm" variant="default" onClick={() => setTagModalOpened(true)}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      
      <TagList 
        // 5. Pasamos el trigger GLOBAL a TagList
        refetchTrigger={globalRefetchTrigger} 
        onRefetch={handleTagSuccess}
      />
      
      <CreateFolderModal 
        opened={folderModalOpened} 
        onClose={() => setFolderModalOpened(false)}
        onSuccess={handleFolderSuccess}
      />
      
      <CreateTagModal 
        opened={tagModalOpened} 
        onClose={() => setTagModalOpened(false)}
        onSuccess={handleTagSuccess}
      />
    </>
  );
};

export default Sidebar;