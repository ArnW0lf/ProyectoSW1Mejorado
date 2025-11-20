class WebSocketService {
  static instance = null;
  callbacks = {}; // Almacena funciones para actualizar la UI
  currentRoom = null; // Track current room
  isConnecting = false; // Evitar conexiones duplicadas

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
    // Si ya estamos conectados a la misma sala, no hacer nada
    if (this.currentRoom === roomName && this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
      console.log(`✅ Ya conectado a sala: ${roomName}`);
      return;
    }

    // Si estamos intentando conectar o ya conectados a otra sala, desconectar primero
    if (this.socketRef && (this.socketRef.readyState === WebSocket.OPEN || this.socketRef.readyState === WebSocket.CONNECTING)) {
      console.log(`⏹️  Desconectando de sala anterior: ${this.currentRoom}`);
      this.socketRef.close();
    }

    // 1. Recuperamos el token del almacenamiento local
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error("❌ No hay token de autenticación. No se puede conectar al chat.");
      return;
    }

    if (this.isConnecting) {
      console.warn('⚠️ Conexión en progreso, espera...');
      return;
    }

    this.isConnecting = true;
    this.currentRoom = roomName;

    // 2. Lo enviamos como parámetro en la URL (?token=...)
    const path = `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`;
    console.log(`🔌 Intentando conectar a: ${path}`);

    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => {
      console.log('✅ WebSocket conectado correctamente a sala:', roomName);
      this.isConnecting = false;
    };

    this.socketRef.onmessage = (e) => { this.socketNewMessage(e.data); };

    this.socketRef.onerror = (e) => {
      console.error('❌ Error de WebSocket:', e);
      this.isConnecting = false;
    };

    this.socketRef.onclose = () => {
      console.log('🔌 WebSocket desconectado de sala:', roomName);
      this.isConnecting = false;
      if (this.currentRoom === roomName) {
        this.currentRoom = null;
      }
    };
  }

  // Desconectar
  disconnect() {
    if (this.socketRef && this.socketRef.readyState !== WebSocket.CLOSED) {
      console.log('⏹️  Cerrando conexión WebSocket...');
      this.socketRef.close();
    }
    this.currentRoom = null;
  }

  // Enviar mensaje (JSON)
  sendMessage(data) {
    if (this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
      this.socketRef.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ No se pudo enviar: WebSocket no conectado. Estado:', this.socketRef?.readyState);
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