import React from 'react';
import { SimpleGrid, Text } from '@mantine/core';
import DocumentItem from './DocumentItem';

const mockDocumentData = [
  { id: 1, name: 'Contrato_Cliente_A.pdf' },
  { id: 2, name: 'Factura_Noviembre.docx' },
  { id: 3, name: 'Presentacion_Q4.pptx' },
  { id: 4, name: 'Bocetos_Proyecto_Beta.png' },
  { id: 5, name: 'informe_anual_final.pdf' },
];

// 1. Aceptamos 'searchQuery' como prop
const DocumentList = ({ searchQuery }) => {

  // 2. Filtramos los documentos
  const filteredDocuments = mockDocumentData.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. (Opcional) Mostrar un mensaje si no hay resultados
  if (filteredDocuments.length === 0) {
    return <Text>No se encontraron documentos.</Text>;
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }} 
      spacing="md"
    >
      {/* 4. Mapeamos sobre los documentos filtrados */}
      {filteredDocuments.map((doc) => (
        <DocumentItem key={doc.id} document={doc} />
      ))}
    </SimpleGrid>
  );
};

export default DocumentList;