import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, ActionIcon, ScrollArea, Text, Box, Group, Avatar, Transition } from '@mantine/core';
// 1. Añadimos los iconos del micrófono
import { IconSend, IconX, IconMessageChatbot, IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';
import WebSocketInstance from '../api/socketService';
import { useAuth } from '../context/AuthContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const ChatWindow = ({ roomName = "general" }) => { 
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const viewport = useRef(null);
  const { user } = useAuth();

  // 2. Usamos el Hook de Reconocimiento de Voz
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // 3. Efecto Mágico: Cuando el navegador detecta texto, lo pone en el input
  useEffect(() => {
    if (transcript) {
      // Concatenamos el texto hablado al texto existente (con un espacio si hace falta)
      setInputValue((prev) => {
        const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + spacer + transcript;
      });
    }
  }, [transcript]);

  useEffect(() => {
    if (opened) {
      WebSocketInstance.connect(roomName);
      
      WebSocketInstance.addCallbacks((data) => {
        setMessages((prev) => [...prev, data]);
      });
    } else {
      WebSocketInstance.disconnect();
      // Si cierran el chat mientras graban, detenemos el micrófono
      if (isListening) stopListening();
    }
    
    return () => {
      if (opened) WebSocketInstance.disconnect();
    };
  }, [opened, roomName]); // Eliminamos isListening de aquí para evitar reconexiones innecesarias

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

  return (
    <>
      {/* Botón Flotante */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Transition transition="scale" mounted={!opened}>
          {(styles) => (
            <ActionIcon 
              style={{ 
                ...styles, 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' 
              }} 
              radius="xl" 
              size={60} 
              color="violet" 
              variant="filled"
              onClick={() => setOpened(true)}
            >
              <IconMessageChatbot size={34} />
            </ActionIcon>
          )}
        </Transition>
      </div>

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
                <Text fw={700}>Sala: {roomName}</Text>
              </Group>
              <ActionIcon variant="transparent" c="white" onClick={() => setOpened(false)}>
                <IconX />
              </ActionIcon>
            </Group>

            {/* Área de Mensajes */}
            <ScrollArea viewportRef={viewport} style={{ flex: 1, padding: '15px' }} bg="gray.0">
              {messages.length === 0 && (
                <Text c="dimmed" size="sm" ta="center" mt="xl">
                  No hay mensajes aún. ¡Di hola!
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

            {/* Input Area Actualizada */}
            <Box p="md" style={{ borderTop: '1px solid #eee' }}>
              <Group gap="xs">
                {/* 4. Botón de Micrófono (Solo si hay soporte) */}
                {hasSupport && (
                  <ActionIcon
                    variant={isListening ? "filled" : "light"} 
                    color={isListening ? "red" : "gray"}
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? "Detener grabación" : "Hablar para escribir"}
                    // Animación simple de "pulso" si está escuchando
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
      
      {/* Estilo global para la animación del micrófono (opcional) */}
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