// mobile/__tests__/App.test.tsx

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import App from '../App';
import WebSocketService from '../src/WebSocketService';

// Mock WebSocketService
jest.mock('../src/WebSocketService', () => ({
  createShare: jest.fn().mockResolvedValue('12345'),
  connect: jest.fn(),
  disconnect: jest.fn(),
  sendCommand: jest.fn(),
  interrupt: jest.fn(),
  respondToPermission: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and connects to WebSocket', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => expect(WebSocketService.createShare).toHaveBeenCalled());

    expect(WebSocketService.connect).toHaveBeenCalled();
    expect(getByText('Build Agent')).toBeDefined();
    expect(getByPlaceholderText('Enter command')).toBeDefined();
  }, 10000);

  it('sends a command when the send button is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    const input = getByPlaceholderText('Enter command');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'test command');
    fireEvent.press(sendButton);

    expect(WebSocketService.sendCommand).toHaveBeenCalledWith('test command', 'build');
  });

  it('switches the active agent', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    const planAgentButton = getByText('Plan Agent');
    const input = getByPlaceholderText('Enter command');
    const sendButton = getByText('Send');

    fireEvent.press(planAgentButton);
    fireEvent.changeText(input, 'test command');
    fireEvent.press(sendButton);

    expect(WebSocketService.sendCommand).toHaveBeenCalledWith('test command', 'plan');
  });

  it('sends an interrupt when the interrupt button is pressed', async () => {
    const { getByText } = render(<App />);
    const interruptButton = getByText('Interrupt');

    fireEvent.press(interruptButton);

    expect(WebSocketService.interrupt).toHaveBeenCalled();
  });
});
