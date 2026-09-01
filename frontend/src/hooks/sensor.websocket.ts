import { Sensor } from "../types/sensor"; // ประเภทข้อมูลของ Sensor (มี history_value_sensor ด้วย)
import { buildWsUrl } from "./ws";

type SensorCallback = (data: Sensor) => void;

class SensorWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: SensorCallback[] = [];

  constructor(private url: string) {}

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () =>
      console.log(`[WS] Sensor Connected: ${this.url}`);
    this.socket.onmessage = (e) => {
      try {
        const data: Sensor = JSON.parse(e.data);
        this.listeners.forEach((cb) => cb(data));
      } catch (err) {
        console.error("[WS] Sensor JSON parse failed:", err);
      }
    };
    this.socket.onclose = () =>
      console.log(`[WS] Sensor Disconnected: ${this.url}`);
    this.socket.onerror = (err) => console.error(`[WS] Sensor Error:`, err);
  }

  onMessage(callback: SensorCallback) {
    this.listeners.push(callback);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

class SensorWebSocketManager {
  private clients: Map<number, SensorWebSocketClient> = new Map();

  connect(sensorId: number, onMessage: SensorCallback) {
    if (this.clients.has(sensorId)) {
      console.warn(`[WS] Already connected to sensor ${sensorId}`);
      return;
    }

    const client = new SensorWebSocketClient(
      buildWsUrl(`/ws/sensors/${sensorId}`)
    );

    client.connect();
    client.onMessage(onMessage);
    this.clients.set(sensorId, client);
  }

  disconnect(sensorId: number) {
    const client = this.clients.get(sensorId);
    if (client) {
      client.disconnect();
      this.clients.delete(sensorId);
    }
  }
}

export const sensorWebSocketService = new SensorWebSocketManager();
