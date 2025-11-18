import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, TextInput, ActionIcon, ScrollArea, Text, Box, Group, Avatar, Transition 
} from '@mantine/core';
import { IconSend, IconX, IconMessageChatbot } from '@tabler/icons-react';
import WebSocketInstance from '../api/socketService';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ roomName = "general" }) => { // Por defecto sala "general"
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const viewport = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Conectar al abrir el chat
    if (opened) {
      WebSocketInstance.connect(roomName);
      
      // 2. Escuchar mensajes
      WebSocketInstance.addCallbacks((data) => {
        setMessages((prev) => [...prev, data]);
      });
    } else {
      // Desconectar al cerrar (opcional, ahorra recursos)
      WebSocketInstance.disconnect();
    }
    
    // Limpieza
    return () => {
      if (opened) WebSocketInstance.disconnect();
    };
  }, [opened, roomName]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const messageData = {
      message: inputValue,
      // El backend ya sabe quiénes somos por el token, 
      // pero enviamos el texto crudo para que él lo traduzca.
    };

    WebSocketInstance.sendMessage(messageData);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <>
      {/* Botón Flotante para abrir el chat */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Transition transition="scale" mounted={!opened}>
          {(styles) => (
            <ActionIcon 
              // 1. MODIFICACIÓN: Fusionamos los estilos de transición con nuestra sombra manual
              style={{ 
                ...styles, 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' 
              }} 
              radius="xl" 
              size={60} 
              color="violet" 
              variant="filled"
              onClick={() => setOpened(true)}
              // 2. MODIFICACIÓN: Eliminamos la prop 'boxShadow="md"' que causaba el error
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

            {/* Input */}
            <Box p="md" style={{ borderTop: '1px solid #eee' }}>
              <Group gap="xs">
                <TextInput 
                  placeholder="Escribe un mensaje..." 
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
    </>
  );
};

export default ChatWindow;