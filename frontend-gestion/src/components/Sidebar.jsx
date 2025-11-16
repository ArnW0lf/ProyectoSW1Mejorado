import React, { useState } from 'react';
import { Box, Title, Group, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import FolderTree from './FolderTree';
import TagList from './TagList';
import { useAuth } from '../context/AuthContext';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';

const Sidebar = () => {
  const { setSelectedFolderId } = useAuth();
  
  const [refetchFolders, setRefetchFolders] = useState(0);
  const [folderModalOpened, setFolderModalOpened] = useState(false);

  const [refetchTags, setRefetchTags] = useState(0);
  const [tagModalOpened, setTagModalOpened] = useState(false);

  const handleFolderSuccess = () => {
    setRefetchFolders(count => count + 1);
    setFolderModalOpened(false);
  };

  // 2. Esta función se llamará para CUALQUIER éxito de CRUD de etiquetas
  const handleTagSuccess = () => {
    setRefetchTags(count => count + 1); 
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
        refetchTrigger={refetchFolders}
        onRefetch={handleFolderSuccess}
      />

      <Group justify="space-between" mt="xl" mb="sm">
        <Title order={4}>Etiquetas</Title>
        <ActionIcon size="sm" variant="default" onClick={() => setTagModalOpened(true)}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      
      <TagList 
        refetchTrigger={refetchTags} 
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