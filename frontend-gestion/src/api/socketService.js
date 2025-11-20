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

  // Iniciar conexiÃ³n
  connect(roomName) {
    // 1. Recuperamos el token del almacenamiento local
    const token = localStorage.getItem('authToken'); 

    if (!token) {
      console.error("âŒ No hay token de autenticaciÃ³n. No se puede conectar al chat.");
      return;
    }

    // 2. Lo enviamos como parÃ¡metro en la URL (?token=...)
    const path = `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`;
    
    this.socketRef = new WebSocket(path);

    // ... (el resto del codigo onopen, onmessage, etc. sigue igual)
    this.socketRef.onopen = () => { console.log('âœ… WebSocket conectado correctamente'); };
    this.socketRef.onmessage = (e) => { this.socketNewMessage(e.data); };
    this.socketRef.onerror = (e) => { console.error('âŒ Error de WebSocket:', e); };
    this.socketRef.onclose = () => { console.log('ðŸ”Œ WebSocket desconectado'); };
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
      console.warn('âš ï¸ No se pudo enviar: WebSocket no conectado');
    }
  }

  // --- GestiÃ³n de Callbacks ---
  
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