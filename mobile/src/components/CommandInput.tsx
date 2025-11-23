import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Keyboard, Animated, Dimensions, Platform } from 'react-native';

interface Props {
  visible: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CommandInput({ visible, onSend, onClose }: Props) {
  const [text, setText] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Keyboard.dismiss();
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
      onClose();
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Enter command..."
        onSubmitEditing={handleSend}
        returnKeyType="send"
        onBlur={onClose}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10, // Safe area rough handling
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});
