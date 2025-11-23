// mobile/src/WebSocketService.ts

const API_BASE_URL = "https://opencode.ai"; // This is a placeholder and will be updated

class WebSocketService {
  public ws: WebSocket | null = null;
  private shareId: string | null = null;
  private secret: string | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onPermissionRequestCallback: ((data: any) => void) | null = null;
  private sessionId: string | null = null;

  async createShare() {
    try {
      this.sessionId = this.generateSessionId();
      const response = await fetch(`${API_BASE_URL}/share_create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionID: this.sessionId }),
      });
      const data = await response.json();
      this.shareId = data.url.split('/').pop();
      this.secret = data.secret;
      return this.shareId;
    } catch (error) {
      console.error('Error creating share:', error);
      return null;
    }
  }

  connect(onMessageCallback: (data: any) => void, onPermissionRequestCallback: (data: any) => void) {
    if (!this.shareId) {
      console.error("Share ID not created. Call createShare() first.");
      return;
    }

    this.ws = new WebSocket(`${API_BASE_URL.replace('https', 'wss')}/share_poll?id=${this.shareId}`);
    this.onMessageCallback = onMessageCallback;
    this.onPermissionRequestCallback = onPermissionRequestCallback;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.key && data.key.startsWith('session/permission')) {
          if (this.onPermissionRequestCallback) {
            this.onPermissionRequestCallback(data.content);
          }
        } else {
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  async respondToPermission(permissionId: string, response: 'once' | 'always' | 'reject') {
    if (!this.sessionId || !this.secret) {
      console.error("Cannot respond to permission, session not initialized.");
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/share_sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID: this.sessionId,
          secret: this.secret,
          key: 'session.permission.respond',
          content: { sessionID: this.sessionId, permissionID: permissionId, response: response },
        }),
      });
    } catch (error) {
      console.error('Error responding to permission:', error);
    }
  }

  async sendCommand(command: string, agent: string = 'build') {
    if (!this.sessionId || !this.secret) {
      console.error("Cannot send command, session not initialized.");
      return;
    }
    try {
      const messageId = this.generateSessionId();
      await fetch(`${API_BASE_URL}/share_sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID: this.sessionId,
          secret: this.secret,
          key: `session/message/${this.sessionId}/${messageId}`,
          content: { id: messageId, role: 'user', content: command, agent: agent },
        }),
      });
    } catch (error) {
      console.error('Error sending command:', error);
    }
  }

  async interrupt() {
    if (!this.sessionId || !this.secret) {
      console.error("Cannot interrupt, session not initialized.");
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/share_sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID: this.sessionId,
          secret: this.secret,
          key: 'session.interrupt',
          content: 'session.interrupt'
        }),
      });
    } catch (error) {
      console.error('Error sending interrupt:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  private generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new WebSocketService();
