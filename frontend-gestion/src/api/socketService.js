class WebSocketService {
  static instance = null;
  callbacks = {}; // Almacena funciones para actualizar la UI

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  // Iniciar conexión
  connect(roomName) {
    // 1. Recuperamos el token del almacenamiento local
    const token = localStorage.getItem('authToken'); 

    if (!token) {
      console.error("❌ No hay token de autenticación. No se puede conectar al chat.");
      return;
    }

    // 2. Lo enviamos como parámetro en la URL (?token=...)
    const path = `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`;
    
    this.socketRef = new WebSocket(path);

    // ... (el resto del código onopen, onmessage, etc. sigue igual)
    this.socketRef.onopen = () => { console.log('✅ WebSocket conectado correctamente'); };
    this.socketRef.onmessage = (e) => { this.socketNewMessage(e.data); };
    this.socketRef.onerror = (e) => { console.error('❌ Error de WebSocket:', e); };
    this.socketRef.onclose = () => { console.log('🔌 WebSocket desconectado'); };
  }

  // Desconectar
  disconnect() {
    if (this.socketRef) {
      this.socketRef.close();
    }
  }

  // Enviar mensaje (JSON)
  sendMessage(data) {
    if (this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
      this.socketRef.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ No se pudo enviar: WebSocket no conectado');
    }
  }

  // --- Gestión de Callbacks ---
  
  addCallbacks(newMessageCallback) {
    this.callbacks['new_message'] = newMessageCallback;
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const callback = this.callbacks['new_message'];
    if (callback) {
      callback(parsedData);
    }
  }
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;