import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
// 1. Importar el componente de Notificaciones y sus estilos
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider 
      withGlobalStyles 
      withNormalizeCSS 
      theme={{ colorScheme: 'dark' }}
    >
      {/* 2. Añadir el componente Notifications aquí */}
      <Notifications position="top-right" zIndex={1000} />
      
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);