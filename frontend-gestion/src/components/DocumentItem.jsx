import React from 'react';
import { Paper, Text, Group, ActionIcon } from '@mantine/core';
import { IconFileText, IconDownload, IconTrash, IconShare } from '@tabler/icons-react';

// Este componente recibirá un 'documento' como prop
const DocumentItem = ({ document }) => {

  const handleDownload = () => {
    console.log('Descargando:', document.name);
    // Lógica de descarga...
  };

  const handleDelete = () => {
    console.log('Eliminando:', document.name);
    // Lógica de eliminación...
  };

  const handleShare = () => {
    console.log('Compartiendo:', document.name);
    // Lógica para abrir el ShareModal...
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        {/* Nombre del archivo */}
        <Group gap="xs">
          <IconFileText size={20} />
          <Text size="sm" fw={500}>{document.name}</Text>
        </Group>

        {/* Botones de Acción */}
        <Group gap="xs">
          <ActionIcon variant="light" size="sm" onClick={handleShare}>
            <IconShare size={16} />
          </ActionIcon>
          <ActionIcon variant="light" size="sm" onClick={handleDownload}>
            <IconDownload size={16} />
          </ActionIcon>
          <ActionIcon variant="light" color="red" size="sm" onClick={handleDelete}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};

export default DocumentItem;