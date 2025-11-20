import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, ActionIcon, ScrollArea, Text, Box, Group, Avatar, Transition } from '@mantine/core';
// 1. Añadimos iconos de copia, check y cierre
import { IconSend, IconX, IconMessageChatbot, IconMicrophone, IconMicrophoneOff, IconCopy, IconCheck } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks'; // Hook para copiar al portapapeles
import WebSocketInstance from '../api/socketService';
import { useAuth } from '../context/AuthContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

// 2. Aceptamos onClose
const ChatWindow = ({ roomName, onClose }) => { 
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const viewport = useRef(null);
  const { user } = useAuth();
  const clipboard = useClipboard({ timeout: 2000 });

  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => {
        const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + spacer + transcript;
      });
    }
  }, [transcript]);

  // 3. Lógica de apertura/cierre basada en roomName
  useEffect(() => {
    if (!roomName) return;
    
    console.log('📱 ChatWindow: Conectando a sala:', roomName);
    setOpened(true);
    setMessages([]); // Limpiar mensajes al cambiar de sala
    
    // Registrar callback ANTES de conectar
    WebSocketInstance.addCallbacks((data) => {
      console.log('📨 Mensaje recibido:', data);
      setMessages((prev) => [...prev, data]);
    });
    
    // Conectar a la sala
    WebSocketInstance.connect(roomName);
    
    // Cleanup: NO desconectar aquí, solo remover listeners de reconexión
    return () => {
      console.log('📱 ChatWindow: Limpieza (cambio de sala)');
      // No desconectamos aquí para evitar reconexiones innecesarias
    };
  }, [roomName]); // Solo cuando cambia roomName

  // Desconectar SOLO cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log('📱 ChatWindow: Componente desmontado, desconectando...');
      WebSocketInstance.disconnect();
      if (isListening) stopListening();
    };
  }, []); // Solo al desmontar

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const messageData = {
      message: inputValue,
    };

    WebSocketInstance.sendMessage(messageData);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleClose = () => {
    setOpened(false);
    // Damos un pequeño tiempo para la animación de cierre antes de desmontar
    setTimeout(() => {
        if (onClose) onClose();
    }, 300);
  };

  return (
    <>
      {/* Eliminamos el botón flotante de apertura manual */}

      {/* Ventana del Chat */}
      <Transition transition="slide-up" mounted={opened}>
        {(styles) => (
          <Paper
            shadow="xl"
            radius="lg"
            style={{
              ...styles,
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: 350,
              height: 500,
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #eee'
            }}
          >
            {/* Cabecera */}
            <Group justify="space-between" p="md" bg="violet" c="white">
              <Group gap="xs">
                <IconMessageChatbot />
                <Box>
                  <Text fw={700} size="sm" style={{ lineHeight: 1.2 }}>Sala: {roomName}</Text>
                  {/* Botón de Copiar Código */}
                  <Group gap={4} style={{ cursor: 'pointer', opacity: 0.9 }} onClick={() => clipboard.copy(roomName)}>
                    <Text size="xs" c="gray.2">
                      {clipboard.copied ? '¡Copiado!' : 'Copiar código'}
                    </Text>
                    {clipboard.copied ? <IconCheck size={12}/> : <IconCopy size={12}/>}
                  </Group>
                </Box>
              </Group>
              {/* Botón de Cierre */}
              <ActionIcon variant="transparent" c="white" onClick={handleClose}>
                <IconX />
              </ActionIcon>
            </Group>

            {/* Área de Mensajes */}
            <ScrollArea viewportRef={viewport} style={{ flex: 1, padding: '15px' }} bg="gray.0">
              {messages.length === 0 && (
                <Text c="dimmed" size="sm" ta="center" mt="xl">
                  Sala lista. Comparte el código <b>{roomName}</b> para invitar a otros.
                </Text>
              )}
              
              {messages.map((msg, index) => {
                const isMe = msg.username === user?.username;
                return (
                  <Box 
                    key={index} 
                    mb="sm" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: isMe ? 'flex-end' : 'flex-start' 
                    }}
                  >
                    {!isMe && (
                      <Avatar size="sm" radius="xl" color="blue" mr="xs">
                        {msg.username?.[0]?.toUpperCase()}
                      </Avatar>
                    )}
                    <Box
                      bg={isMe ? 'violet' : 'white'}
                      c={isMe ? 'white' : 'black'}
                      style={{
                        maxWidth: '80%',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        borderBottomRightRadius: isMe ? 0 : 12,
                        borderBottomLeftRadius: !isMe ? 0 : 12,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {!isMe && (
                        <Text size="xs" c="dimmed" mb={2}>
                          {msg.username}
                        </Text>
                      )}
                      <Text size="sm">{msg.message}</Text>
                    </Box>
                  </Box>
                );
              })}
            </ScrollArea>

            {/* Input Area */}
            <Box p="md" style={{ borderTop: '1px solid #eee' }}>
              <Group gap="xs">
                {hasSupport && (
                  <ActionIcon
                    variant={isListening ? "filled" : "light"} 
                    color={isListening ? "red" : "gray"}
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? "Detener grabación" : "Hablar para escribir"}
                    style={isListening ? { animation: 'pulse 2s infinite' } : {}}
                  >
                    {isListening ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
                  </ActionIcon>
                )}

                <TextInput 
                  placeholder={isListening ? "Escuchando..." : "Escribe un mensaje..."}
                  style={{ flex: 1 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  onKeyDown={handleKeyPress}
                />
                <ActionIcon 
                  variant="filled" 
                  color="violet" 
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Box>
          </Paper>
        )}
      </Transition>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
      `}</style>
    </>
  );
};

export default ChatWindow;