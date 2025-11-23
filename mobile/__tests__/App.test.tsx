// mobile/__tests__/App.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: ({ children }) => children,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Fling: () => ({
        direction: () => ({
          onEnd: () => ({}),
        }),
      }),
      Race: () => ({}),
    },
    Directions: {},
    // Add missing exports that might be used internally or by other libs
    PanGestureHandler: View,
    State: {},
    ScrollView: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    FlingGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    default: {
      View: View,
      Text: require('react-native').Text,
      Image: require('react-native').Image,
      ScrollView: require('react-native').ScrollView,
      createAnimatedComponent: (component) => component,
    },
    View: View,
    Value: jest.fn(),
    timing: jest.fn(),
  };
});

// Mock ApiService
jest.mock('../src/services/ApiService', () => ({
  loadBaseUrl: jest.fn().mockResolvedValue('http://localhost:3000'),
  connect: jest.fn(),
  disconnect: jest.fn(),
  currentSessionId: 'mock-session-id',
}));

test('renders correctly', () => {
  render(<App />);
});
