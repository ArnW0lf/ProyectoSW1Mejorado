import React, { useState, useEffect } from 'react';
import { Chip, Group, Loader, Text, Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { getTags, deleteTag } from '../api/documentService';
import { notifications } from '@mantine/notifications';
import RenameTagModal from './RenameTagModal';

// 1. Aceptar 'onRefetch'
const TagList = ({ refetchTrigger, onRefetch }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading, selectedTagId, setSelectedTagId } = useAuth();
  
  // 2. Estado para el modal de renombrar
  // Guardamos LA ETIQUETA que se está editando
  const [editingTag, setEditingTag] = useState(null); 

  useEffect(() => {
    // ... (tu useEffect para cargar etiquetas está perfecto)
    const loadTags = async () => {
      try {
        setLoading(true);
        const data = await getTags();
        setTags(data);
      } catch (err) {
        setError('No se pudieron cargar las etiquetas.');
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    loadTags();
  }, [authLoading, refetchTrigger]); 

  // 3. Función de eliminar
  const handleDelete = async (tag) => {
    if (window.confirm(`¿Seguro que quieres eliminar la etiqueta "${tag.name}"?`)) {
      try {
        await deleteTag(tag.id);
        notifications.show({ title: 'Éxito', message: 'Etiqueta eliminada.', color: 'green' });
        onRefetch(); // Recargar la lista
      } catch (err) {
        notifications.show({ title: 'Error', message: 'No se pudo eliminar la etiqueta.', color: 'red' });
      }
    }
  };

  const handleRenameSuccess = () => {
    setEditingTag(null); // Cierra el modal
    onRefetch(); // Recarga la lista
  };

  // ... (tus returns para loading, error, y 'no tienes etiquetas') ...
  if (authLoading || loading) return <Loader size="xs" />;
  if (error) return <Text c="red" size="sm">{error}</Text>;
  if (tags.length === 0) return <Text size="sm">No tienes etiquetas.</Text>;

  return (
    <>
      <Group gap="xs">
        {/* 3. AÑADIR UN BOTÓN "VER TODAS" */}
        <Chip
          checked={selectedTagId === null}
          onChange={() => setSelectedTagId(null)} // Pone el filtro en null
          variant="filled"
        >
          Todas
        </Chip>
        
        {tags.map((tag) => (
          <Group key={tag.id} gap={4} wrap="nowrap" 
            // 4. APLICAR ESTILOS Y ONCLICK AL GRUPO
            onClick={() => setSelectedTagId(tag.id)}
            style={{ 
              paddingLeft: '12px',
              paddingRight: '4px',
              borderRadius: '16px',
              border: '1px solid var(--mantine-color-dark-4)',
              cursor: 'pointer',
              // 5. RESALTAR SI ESTÁ ACTIVO
              backgroundColor: selectedTagId === tag.id ? 'var(--mantine-color-blue-8)' : 'transparent'
            }}
          >
            <Text size="sm">{tag.name}</Text>
            
            <Menu shadow="md" width={200} withinPortal>
              <Menu.Target>
                {/* 6. Detener la propagación del clic */}
                <ActionIcon 
                  variant="subtle" 
                  size="sm" 
                  radius="xl"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {/* ... (tus Menu.Items) ... */}
              </Menu.Dropdown>
            </Menu>
          </Group>
        ))}
      </Group>

      {/* 6. El modal de renombrar (oculto) */}
      <RenameTagModal 
        opened={!!editingTag} // El modal se abre si 'editingTag' no es null
        onClose={() => setEditingTag(null)}
        onSuccess={handleRenameSuccess}
        tag={editingTag}
      />
    </>
  );
};

export default TagList;