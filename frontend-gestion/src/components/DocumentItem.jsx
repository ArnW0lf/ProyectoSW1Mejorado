import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Paper, Text, Group, ActionIcon, Loader, Anchor, Badge } from '@mantine/core';
import { IconFileText, IconDownload, IconTrash, IconShare, IconTag, IconLanguage } from '@tabler/icons-react'; 
import { notifications } from '@mantine/notifications';
import { deleteDocument, downloadDocument } from '../api/documentService'; 
import ShareModal from './ShareModal';
import AssignTagsModal from './AssignTagsModal';
import TranslateModal from './TranslateModal';

/**
 * Insignia para PROPIETARIO, EDITOR, LECTOR
 */
const getPermissionBadge = (level) => {
  let color = 'gray';
  let text = level;

  if (level === 'PROPIETARIO') {
    color = 'violet'; // El color que elegiste
    text = 'PROPIETARIO';
  } else if (level === 'EDITOR') {
    color = 'green'; // Verde para Editor
    text = 'EDITOR';
  } else if (level === 'LECTOR') {
    color = 'gray'; // Gris para Lector
    text = 'LECTOR';
  } else {
    return null; // No mostrar nada
  }
  return <Badge variant="light" color={color} size="sm">{text}</Badge>;
};

/**
 * Insignia para COMPARTIDO (si eres el propietario)
 */
const getSharedBadge = (isShared) => {
  if (!isShared) {
    return null; // No mostrar nada si no está compartido
  }
  
  return (
    <Badge 
      variant="filled" // Relleno
      color="teal"     // Color naranja
      size="sm" 
      leftSection={<IconShare size={12} />}
    >
      COMPARTIDO
    </Badge>
  );
};


const DocumentItem = ({ document, onDeleteSuccess }) => {
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [tagModalOpened, setTagModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [translateModalOpened, setTranslateModalOpened] = useState(false);
  
  const getFilename = (url) => {
    if (!url) return 'Documento';
    return url.split('/').pop(); 
  };
  const filename = getFilename(document.file);

  /**
   * Manejador para el botón de descarga principal (icono)
   */
  const handleDownload = async () => {
    
    // 1. Mostrar la alerta de confirmación
    const userConfirmed = window.confirm(
      "¿Deseas descargar el archivo traducido?"
    );

    // 2. Si el usuario presiona "Cancelar", no hacemos nada.
    if (!userConfirmed) {
      return; 
    }

    // 3. Si el usuario presiona "Aceptar", continuamos
    setIsDownloading(true);
    try {
      // Llama a la API que descarga el archivo original
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

  /**
   * Manejador para el botón de eliminar
   */
  const handleDelete = async () => {
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
      onDeleteSuccess(); // Llama a la función del padre para recargar la lista
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

  const handleTagSuccess = () => {
    setTagModalOpened(false);
    onDeleteSuccess(); // Recargamos para ver los tags actualizados
  };

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          {/* Lado izquierdo: Icono, Nombre y Estado */}
          <Group gap="xs">
            <IconFileText size={20} />
            
            {/* El nombre ahora es un enlace a la página de edición */}
            <Anchor component={Link} to={`/documento/${document.id}`} size="sm" fw={500}>
              {filename}
            </Anchor>
            
            {/* Insignia 1: Propiedad (PROPIETARIO, EDITOR, LECTOR) */}
            {getPermissionBadge(document.permission_level)}
            
            {/* Insignia 2: Estado de Compartido (si es propietario) */}
            {getSharedBadge(document.is_shared)}
          </Group>

          {/* Lado derecho: Iconos de acción */}
          <Group gap="xs">
            {isDeleting || isDownloading ? (
              <Loader size={16} />
            ) : (
              <>
                {/* Botón de Traducir */}
                <ActionIcon variant="light" size="sm" onClick={() => setTranslateModalOpened(true)}>
                  <IconLanguage size={16} />
                </ActionIcon>

                {/* Botón de Asignar Tags */}
                <ActionIcon variant="light" size="sm" onClick={() => setTagModalOpened(true)}>
                  <IconTag size={16} />
                </ActionIcon>
                
                {/* Botón de Compartir */}
                <ActionIcon variant="light" size="sm" onClick={handleShare}>
                  <IconShare size={16} />
                </ActionIcon>
                
                {/* Botón de Descargar (ahora con confirmación) */}
                <ActionIcon variant="light" size="sm" onClick={handleDownload}>
                  <IconDownload size={16} />
                </ActionIcon>
                
                {/* Botón de Eliminar */}
                <ActionIcon variant="light" color="red" size="sm" onClick={handleDelete}>
                  <IconTrash size={16} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>
      </Paper>

      {/* --- Modales --- */}
      
      {/* Modal de Compartir */}
      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        documentName={filename}
        documentId={document.id}
      />
      
      {/* Modal de Asignar Tags */}
      <AssignTagsModal
        opened={tagModalOpened}
        onClose={() => setTagModalOpened(false)}
        onSuccess={handleTagSuccess}
        document={document}
      />
      
      {/* Modal de Traducir */}
      <TranslateModal
        opened={translateModalOpened}
        onClose={() => setTranslateModalOpened(false)}
        document={{...document, name: filename}}
      />
    </>
  );
};

export default DocumentItem;