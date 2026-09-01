import { Notification } from "../types/notification";
import { buildWsUrl } from "./ws";

type Topic =
  | "sos/pending"
  | "sos/accepted"
  | "emergency/pending"
  | "emergency/accepted";

type Callback = (data: Notification) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Callback[] = [];

  constructor(private url: string) {}

  connect() {
    this.socket = new WebSocket(this.url);
    // this.socket.onopen = () => console.log(`[WS] Connected: ${this.url}`);
    this.socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.listeners.forEach((cb) => cb(data));
      } catch (err) {
        console.error("[WS] JSON parse failed:", err);
      }
    };
    // this.socket.onclose = () => console.log(`[WS] Disconnected: ${this.url}`);
    this.socket.onerror = (err) => console.error(`[WS] Error:`, err);
  }

  onMessage(callback: Callback) {
    this.listeners.push(callback);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

class NotificationWebSocketManager {
  private clients: Map<Topic, WebSocketClient> = new Map();

  connect(topic: Topic, onMessage: Callback) {
    if (this.clients.has(topic)) {
      // console.warn(`[WS] Already connected: ${topic}`);
      return;
    }

    const client = new WebSocketClient(
      buildWsUrl(`/ws/notifications/${topic}`)
    );

    client.connect();
    client.onMessage(onMessage);
    this.clients.set(topic, client);
  }

  disconnect(topic: Topic) {
    const client = this.clients.get(topic);
    if (client) {
      client.disconnect();
      this.clients.delete(topic);
    }
  }
}

export const notificationWebSocketService = new NotificationWebSocketManager();
