import { useState } from 'react'; // <--- 1. Importar useState
import { AppShell } from '@mantine/core';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ChatWindow from './components/ChatWindow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProfilePage from './pages/ProfilePage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage';
import EmailVerifyPage from './pages/EmailVerifyPage';
import DocumentViewPage from './pages/DocumentViewPage';

function App() {
  const { isAuthenticated } = useAuth();
  
  // 2. Estado para controlar la sala activa (null = cerrado)
  const [activeRoom, setActiveRoom] = useState(null); 

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !isAuthenticated, desktop: !isAuthenticated },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* 3. Pasamos la función para activar sala al Sidebar */}
        <Sidebar onJoinRoom={(roomName) => setActiveRoom(roomName)} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password-reset" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route 
            path="/documento/:id"
            element={<ProtectedRoute><DocumentViewPage /></ProtectedRoute>}
          />
        </Routes>

        {/* 4. El ChatWindow es dinámico ahora */}
        {isAuthenticated && activeRoom && (
          <ChatWindow 
            roomName={activeRoom} 
            onClose={() => setActiveRoom(null)} // Función para cerrar la sala
          /> 
        )}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;