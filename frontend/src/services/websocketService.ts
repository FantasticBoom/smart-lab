type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:8000/api/v1/websocket'; 
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectTimeout: number | null = null;
  private isIntentionalDisconnect: boolean = false;


  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.isIntentionalDisconnect = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[UIGM SMART LAB WS] Terhubung ke server monitoring real-time.');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        // Distribusikan data broadcast dari backend ke seluruh fungsi listener yang terdaftar
        this.listeners.forEach((callback) => callback(payload));
      } catch (error) {
        console.error('[UIGM SMART LAB WS] Gagal mengurai data masuk:', error);
      }
    };

    this.ws.onclose = () => {
      console.warn('[UIGM SMART LAB WS] Koneksi terputus dari server.');
      this.ws = null;
      
      // Pemicu Auto-Reconnect Otomatis jika putusnya bukan karena aksi Logout Admin
      if (!this.isIntentionalDisconnect) {
        console.log('[UIGM SMART LAB WS] Mencoba menyambung kembali dalam 5 detik...');
        this.reconnectTimeout = window.setTimeout(() => this.connect(), 5000);
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('[UIGM SMART LAB WS] Terjadi kesalahan pada socket:', error);
      if (this.ws) this.ws.close();
    };
  }


  public subscribe(callback: WebSocketCallback): () => void {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }


  public disconnect(): void {
    this.isIntentionalDisconnect = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    console.log('[UIGM SMART LAB WS] Koneksi ditutup secara sengaja oleh sistem.');
  }
}


export const websocketService = new WebSocketService();