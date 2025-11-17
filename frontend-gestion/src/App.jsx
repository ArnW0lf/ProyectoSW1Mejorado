import { AppShell } from '@mantine/core';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // 1. Importar el hook

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
  const { isAuthenticated } = useAuth(); // 3. Obtener estado de autenticación

  return (
    <AppShell
      header={{ height: 60 }}
      // 4. Configurar el panel lateral (Columna 1)
      navbar={{
        width: 250, // Ancho de la columna
        breakpoint: 'sm',
        // Ocultar el panel si no está autenticado (ej. en /login)
        collapsed: { mobile: !isAuthenticated, desktop: !isAuthenticated },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      {/* 5. Añadir el componente de panel lateral */}
      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        {/* El contenido de la página (rutas) se renderiza aquí */}
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
      </AppShell.Main>
    </AppShell>
  );
}

export default App;