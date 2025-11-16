import React, { useState } from 'react';
import { Modal, Button, Select, Loader, Textarea, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { translateDocument } from '../api/documentService';

// Lista de idiomas (puedes expandirla)
const languages = [
  { value: 'en', label: 'Inglés' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
  { value: 'pt', label: 'Portugués' },
];

const TranslateModal = ({ opened, onClose, document }) => {
  const [targetLanguage, setTargetLanguage] = useState('en'); // 'en' por defecto
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!document) return;
    
    setLoading(true);
    setTranslatedText(''); // Limpiar traducción anterior
    try {
      const result = await translateDocument(document.id, targetLanguage);
      setTranslatedText(result.translated_text);
      notifications.show({
        title: 'Traducción Completa',
        message: `Traducido de ${result.detected_source_language} a ${targetLanguage}.`,
        color: 'green',
      });
    } catch (err) {
      const message = err.response?.data?.error || 'No se pudo traducir el documento.';
      notifications.show({
        title: 'Error de Traducción',
        message: message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Limpiar estado cuando se cierra el modal
  const handleClose = () => {
    setTranslatedText('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={`Traducir "${document?.name || 'Documento'}"`}
      centered
      size="lg" // Modal más grande para el texto
    >
      <Select
        label="Traducir a:"
        placeholder="Selecciona un idioma"
        data={languages}
        value={targetLanguage}
        onChange={setTargetLanguage}
        disabled={loading}
      />
      
      <Button onClick={handleTranslate} loading={loading} mt="md" fullWidth>
        Traducir
      </Button>

      {translatedText && (
        <Textarea
          label="Resultado de la Traducción:"
          value={translatedText}
          readOnly
          mt="md"
          minRows={10}
          autosize
        />
      )}
    </Modal>
  );
};

export default TranslateModal;