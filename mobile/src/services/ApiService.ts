// mobile/src/services/ApiService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionInfo {
  id: string;
  title: string;
  // add other fields as needed
}

export interface ProviderInfo {
  id: string;
  models: any[];
}

class ApiService {
  private baseUrl: string = 'http://localhost:3000'; // Default, will be updated
  private eventSource: XMLHttpRequest | null = null;
  private onLogCallback: ((data: any) => void) | null = null;
  private onPermissionCallback: ((data: any) => void) | null = null;
  public currentSessionId: string | null = null;

  async setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    await AsyncStorage.setItem('opencode_base_url', this.baseUrl);
  }

  async loadBaseUrl() {
    const stored = await AsyncStorage.getItem('opencode_base_url');
    if (stored) {
      this.baseUrl = stored;
    }
    return this.baseUrl;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async checkConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const response = await fetch(`${url}/config`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async discover(subnetPrefix: string, onProgress: (ip: string, port: number) => void): Promise<string | null> {
    const startPort = 55000;
    const endPort = 55010; // Scan a small range for now for performance
    // Also scan standard port 3000 just in case
    const ports = [3000, ...Array.from({length: endPort - startPort + 1}, (_, i) => startPort + i)];

    // Scan .1 to .20 (just an example range, real discovery might need to be broader or smarter)
    // In a real scenario, we might iterate 1-255.
    const hosts = Array.from({length: 20}, (_, i) => `${subnetPrefix}.${i + 1}`);

    for (const host of hosts) {
      for (const port of ports) {
        const url = `http://${host}:${port}`;
        onProgress(host, port);
        if (await this.checkConnection(url)) {
          return url;
        }
      }
    }
    return null;
  }

  connect(onLog: (data: any) => void, onPermission: (data: any) => void) {
    this.disconnect();
    this.onLogCallback = onLog;
    this.onPermissionCallback = onPermission;

    console.log(`Connecting to events at ${this.baseUrl}/global/event`);

    // Using XMLHttpRequest for SSE-like behavior in RN without external lib
    this.eventSource = new XMLHttpRequest();
    this.eventSource.open('GET', `${this.baseUrl}/global/event`);
    this.eventSource.setRequestHeader('Accept', 'text/event-stream');

    this.eventSource.onreadystatechange = () => {
      if (this.eventSource?.readyState === 3) { // Loading (receiving data)
        const responseText = this.eventSource.responseText;
        this.processStreamData(responseText);
      }
    };

    this.eventSource.onerror = (e) => {
      console.error('Event stream error', e);
      // Simple reconnect logic could go here
    };

    this.eventSource.send();
  }

  private lastProcessedLength = 0;

  private processStreamData(text: string) {
    const newText = text.substring(this.lastProcessedLength);
    this.lastProcessedLength = text.length;

    const lines = newText.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.substring(6);
          const data = JSON.parse(jsonStr);
          this.handleEvent(data);
        } catch (e) {
          // console.error('Error parsing SSE data', e);
        }
      }
    }
  }

  private handleEvent(event: any) {
    // Check for specific event types based on server/server.ts
    // Server emits: { type: "server.connected", properties: {} } or Bus payloads

    // Handle Permissions (Assuming they come as a specific event type, waiting for clarification or assuming 'session.permission')
    // Looking at server.ts, it doesn't explicitly detail permission event structure other than Bus.publish.
    // However, the old code used 'session/permission'.
    // Let's assume the server publishes an event with type 'session.permission' or similar.

    if (event.type === 'session.permission.request' || event.type === 'permission.request') {
      if (this.onPermissionCallback) {
        this.onPermissionCallback(event.properties || event);
      }
      return;
    }

    if (this.onLogCallback) {
      this.onLogCallback(event);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.abort();
      this.eventSource = null;
    }
    this.lastProcessedLength = 0;
  }

  // --- Commands ---

  async cycleAgent() {
    return this.post('/tui/execute-command', { command: 'agent_cycle' });
  }

  async interrupt() {
    return this.post('/tui/execute-command', { command: 'session_interrupt' });
  }

  async sendCommand(sessionId: string, text: string) {
    // Based on server.ts: post /session/:id/message
    return this.post(`/session/${sessionId}/message`, {
      role: 'user',
      content: text,
      // agent: 'build' // Optional, server infers or we can set
    });
  }

  async respondToPermission(sessionId: string, permissionId: string, response: 'once' | 'always' | 'reject') {
    return this.post(`/session/${sessionId}/permissions/${permissionId}`, {
      response
    });
  }

  // --- Data Fetching ---

  async getSessions(): Promise<SessionInfo[]> {
    return this.get('/session');
  }

  async getProviders(): Promise<any> {
    return this.get('/provider');
  }

  async getModels(providerId: string): Promise<any> {
    // Logic to get models, server returns all providers in /provider
    // We can filter on client side
    return [];
  }

  // --- Helpers ---

  private async post(endpoint: string, body: any) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private async get(endpoint: string) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`);
      if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

export default new ApiService();
