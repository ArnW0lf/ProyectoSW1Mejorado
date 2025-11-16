import React, { useState } from 'react';
import { Paper, Text, Group, ActionIcon, Loader } from '@mantine/core';
// 1. Importar el nuevo icono
import { IconFileText, IconDownload, IconTrash, IconShare, IconTag } from '@tabler/icons-react'; 
import { notifications } from '@mantine/notifications';

// 2. Limpiar las importaciones (ShareModal solo se importa una vez)
import { deleteDocument, downloadDocument } from '../api/documentService'; 
import ShareModal from './ShareModal';
import AssignTagsModal from './AssignTagsModal'; // 3. Importar el nuevo modal de etiquetas

const DocumentItem = ({ document, onDeleteSuccess }) => {
  const [shareModalOpened, setShareModalOpened] = useState(false);
  // 4. Estado para el modal de etiquetas
  const [tagModalOpened, setTagModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isDownloading, setIsDownloading] = useState(false);

  const getFilename = (url) => {
    if (!url) return 'Documento';
    return url.split('/').pop(); 
  };
  const filename = getFilename(document.file);

  const handleDownload = async () => {
    // ... (tu función de descarga)
    setIsDownloading(true);
    try {
      await downloadDocument(document.id, filename);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo descargar el documento.',
        color: 'red',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    // ... (tu función de eliminar)
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${filename}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDocument(document.id);
      notifications.show({
        title: 'Éxito',
        message: 'Documento eliminado correctamente.',
        color: 'green',
      });
      onDeleteSuccess();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo eliminar el documento.',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    setShareModalOpened(true);
  };

  // 5. Función para cuando se guardan las etiquetas
  const handleTagSuccess = () => {
    setTagModalOpened(false);
    onDeleteSuccess(); // Re-usamos la función de refetch de DocumentList
  };

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconFileText size={20} />
            <Text size="sm" fw={500}>{filename}</Text>
          </Group>

          <Group gap="xs">
            {isDeleting || isDownloading ? (
              <Loader size={16} />
            ) : (
              <>
                {/* 6. AÑADIR EL NUEVO ICONO/BOTÓN DE ETIQUETA */}
                <ActionIcon variant="light" size="sm" onClick={() => setTagModalOpened(true)}>
                  <IconTag size={16} />
                </ActionIcon>
                
                <ActionIcon variant="light" size="sm" onClick={handleShare}>
                  <IconShare size={16} />
                </ActionIcon>
                <ActionIcon variant="light" size="sm" onClick={handleDownload}>
                  <IconDownload size={16} />
                </ActionIcon>
                <ActionIcon variant="light" color="red" size="sm" onClick={handleDelete}>
                  <IconTrash size={16} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>
      </Paper>

      {/* 7. Renderizar los modales (ocultos) */}
      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        documentName={filename}
        documentId={document.id}
      />
      <AssignTagsModal
        opened={tagModalOpened}
        onClose={() => setTagModalOpened(false)}
        onSuccess={handleTagSuccess}
        document={document} // Pasamos el objeto 'document' completo
      />
    </>
  );
};

export default DocumentItem;