import React, { useState } from 'react';
import { Chip, Group } from '@mantine/core';

// --- Datos de Prueba (Mock Data) ---
// Más adelante, esto vendrá de la API
const mockTagData = [
  { id: 'tag1', name: 'Importante' },
  { id: 'tag2', name: 'Contratos' },
  { id: 'tag3', name: 'Urgente' },
  { id: 'tag4', name: 'Borradores' },
];
// ---------------------------------

const TagList = () => {
  // Estado para manejar qué etiquetas están seleccionadas
  // 'multiple' está habilitado por defecto, así que 'value' es un array
  const [selectedTags, setSelectedTags] = useState([]);

  const handleChange = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);
    console.log('Etiquetas seleccionadas:', newSelectedTags);
    // Aquí es donde filtrarías la DocumentList por etiquetas
  };

  return (
    <Chip.Group value={selectedTags} onChange={handleChange} multiple>
      <Group gap="xs">
        {mockTagData.map((tag) => (
          <Chip key={tag.id} value={tag.id} variant="outline" size="sm">
            {tag.name}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
  );
};

export default TagList;