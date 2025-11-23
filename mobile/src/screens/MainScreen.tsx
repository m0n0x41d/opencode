import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import CommandInput from '../components/CommandInput';
import ApprovalModal from '../components/ApprovalModal';

export default function MainScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [logs, setLogs] = useState<any[]>([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [permissionRequest, setPermissionRequest] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    ApiService.loadBaseUrl().then(() => {
      ApiService.connect(
        (data) => {
          setLogs(prev => [...prev, data]);
          // Auto scroll
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        },
        (perm) => {
          setPermissionRequest(perm);
        }
      );
    });

    return () => ApiService.disconnect();
  }, []);

  const handleSend = async (text: string) => {
    if (ApiService.currentSessionId) {
      await ApiService.sendCommand(ApiService.currentSessionId, text);
    } else {
      // Just for feedback if no session selected
      setLogs(prev => [...prev, { type: 'local', properties: { text: "No active session. Swipe down to select one." } }]);
    }
  };

  const handleRespondPermission = async (response: 'once' | 'always' | 'reject') => {
    if (permissionRequest && ApiService.currentSessionId) {
      await ApiService.respondToPermission(ApiService.currentSessionId, permissionRequest.id, response);
      setPermissionRequest(null);
    }
  };

  // Gestures
  const swipeLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => {
    console.log("Swipe Left - Cycle Agent");
    ApiService.cycleAgent();
  });

  const swipeRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => {
    console.log("Swipe Right - Cycle Agent");
    ApiService.cycleAgent();
  });

  const swipeDown = Gesture.Fling().direction(Directions.DOWN).onEnd(() => {
    console.log("Swipe Down - Settings");
    // @ts-ignore
    navigation.navigate('Settings');
  });

  const swipeUp = Gesture.Fling().direction(Directions.UP).onEnd(() => {
    console.log("Swipe Up - Input");
    setInputVisible(true);
  });

  const composedGestures = Gesture.Race(swipeLeft, swipeRight, swipeDown, swipeUp);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <GestureDetector gesture={composedGestures}>
        <View style={styles.content}>
          <ScrollView ref={scrollViewRef} style={styles.logContainer}>
            {logs.length === 0 && (
              <Text style={styles.placeholder}>
                No logs. Swipe down to configure connection.
              </Text>
            )}
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {typeof log === 'string' ? log : JSON.stringify(log)}
              </Text>
            ))}
          </ScrollView>
        </View>
      </GestureDetector>

      <CommandInput
        visible={isInputVisible}
        onSend={handleSend}
        onClose={() => setInputVisible(false)}
      />

      <ApprovalModal
        visible={!!permissionRequest}
        request={permissionRequest}
        onRespond={handleRespondPermission}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  content: { flex: 1 },
  logContainer: { flex: 1, padding: 10 },
  logText: { color: '#0f0', fontFamily: 'monospace', fontSize: 12, marginBottom: 5 },
  placeholder: { color: '#aaa', textAlign: 'center', marginTop: 50 },
});
