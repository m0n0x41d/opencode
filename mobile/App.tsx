// mobile/App.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebSocketService from './src/WebSocketService';

interface LogMessage {
  id: string;
  text: string;
}

type Agent = 'build' | 'plan';

interface PermissionRequest {
  id: string;
  title: string;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [command, setCommand] = useState('');
  const [activeAgent, setActiveAgent] = useState<Agent>('build');
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const connectToWebSocket = async () => {
      const shareId = await WebSocketService.createShare();
      if (shareId) {
        WebSocketService.connect(
          (data) => {
            setLogs((prevLogs) => [
              ...prevLogs,
              { id: Date.now().toString(), text: JSON.stringify(data) },
            ]);
          },
          (permissionData) => {
            setPermissionRequest(permissionData);
          }
        );
      }
    };

    connectToWebSocket();

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  const handleSendCommand = () => {
    if (command.trim()) {
      WebSocketService.sendCommand(command, activeAgent);
      setCommand('');
    }
  };

  const handleInterrupt = () => {
    WebSocketService.interrupt();
  };

  const handlePermissionResponse = (response: 'once' | 'always' | 'reject') => {
    if (permissionRequest) {
      WebSocketService.respondToPermission(permissionRequest.id, response);
      setPermissionRequest(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.controlsContainer}>
        <View style={styles.agentSelector}>
          <Button title="Build Agent" onPress={() => setActiveAgent('build')} disabled={activeAgent === 'build'} />
          <Button title="Plan Agent" onPress={() => setActiveAgent('plan')} disabled={activeAgent === 'plan'} />
        </View>
        <Button title="Interrupt" onPress={handleInterrupt} color="red" />
      </View>
      <View style={styles.logContainer}>
        <ScrollView ref={scrollViewRef}>
          {logs.map((log) => (
            <Text key={log.id} style={styles.logText}>
              {log.text}
            </Text>
          ))}
        </ScrollView>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={setCommand}
          placeholder="Enter command"
        />
        <Button title="Send" onPress={handleSendCommand} />
      </View>
      <Modal
        transparent={true}
        visible={!!permissionRequest}
        onRequestClose={() => handlePermissionResponse('reject')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Permission Request</Text>
            <Text style={styles.modalText}>{permissionRequest?.title}</Text>
            <View style={styles.modalButtons}>
              <Button title="Approve Once" onPress={() => handlePermissionResponse('once')} />
              <Button title="Approve Always" onPress={() => handlePermissionResponse('always')} />
              <Button title="Deny" onPress={() => handlePermissionResponse('reject')} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  agentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  logContainer: {
    flex: 1,
    padding: 10,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default App;
