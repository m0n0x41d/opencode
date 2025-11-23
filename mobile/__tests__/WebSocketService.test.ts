// mobile/__tests__/WebSocketService.test.ts

import WebSocketService from '../src/WebSocketService';

// Mock WebSocket
const mockWebSocket = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  onclose: jest.fn(),
  close: jest.fn(),
};
global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ url: 'https://opencode.ai/s/12345', secret: 'abcde' }),
  })
) as jest.Mock;

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a share and connects to the WebSocket', async () => {
    const onMessage = jest.fn();
    const onPermission = jest.fn();
    await WebSocketService.createShare();
    WebSocketService.connect(onMessage, onPermission);
    expect(global.fetch).toHaveBeenCalledWith('https://opencode.ai/share_create', expect.any(Object));
    expect(global.WebSocket).toHaveBeenCalledWith('wss://opencode.ai/share_poll?id=12345');
  });

  it('handles incoming messages', async () => {
    const onMessage = jest.fn();
    const onPermission = jest.fn();
    await WebSocketService.createShare();
    WebSocketService.connect(onMessage, onPermission);
    const message = { key: 'session/message/123', content: 'hello' };
    mockWebSocket.onmessage({ data: JSON.stringify(message) });
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it('handles permission requests', async () => {
    const onMessage = jest.fn();
    const onPermission = jest.fn();
    await WebSocketService.createShare();
    WebSocketService.connect(onMessage, onPermission);
    const permission = { key: 'session/permission/abc', content: { id: 'abc', title: 'test' } };
    mockWebSocket.onmessage({ data: JSON.stringify(permission) });
    expect(onPermission).toHaveBeenCalledWith(permission.content);
  });

  it('sends a command', async () => {
    await WebSocketService.createShare();
    await WebSocketService.sendCommand('test command', 'build');
    expect(global.fetch).toHaveBeenCalledWith('https://opencode.ai/share_sync', expect.any(Object));
  });

  it('sends an interrupt', async () => {
    await WebSocketService.createShare();
    await WebSocketService.interrupt();
    expect(global.fetch).toHaveBeenCalledWith('https://opencode.ai/share_sync', expect.any(Object));
  });

  it('responds to a permission request', async () => {
    await WebSocketService.createShare();
    await WebSocketService.respondToPermission('abc', 'once');
    expect(global.fetch).toHaveBeenCalledWith('https://opencode.ai/share_sync', expect.any(Object));
  });
});
