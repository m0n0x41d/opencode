import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import ApiService, { SessionInfo } from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const [ip, setIp] = useState('192.168.1.100');
  const [port, setPort] = useState('55000');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedUrl = await ApiService.loadBaseUrl();
    if (savedUrl) {
      // rough parse
      try {
        const url = new URL(savedUrl);
        setIp(url.hostname);
        setPort(url.port);
      } catch (e) {
        // ignore
      }
    }
    refreshData();
  };

  const saveSettings = async () => {
    const url = `http://${ip}:${port}`;
    await ApiService.setBaseUrl(url);
    Alert.alert("Settings Saved", `Base URL set to ${url}`);
    refreshData();
  };

  const refreshData = async () => {
    try {
      const sess = await ApiService.getSessions();
      setSessions(sess);
      const prov = await ApiService.getProviders();
      setProviders(prov.all || []);
    } catch (e) {
      console.log("Could not fetch data (maybe not connected)");
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanStatus('Starting scan...');
    const subnet = ip.substring(0, ip.lastIndexOf('.')); // Guess subnet from current IP input

    const foundUrl = await ApiService.discover(subnet, (host, p) => {
      setScanStatus(`Checking ${host}:${p}...`);
    });

    setIsScanning(false);
    if (foundUrl) {
      setScanStatus(`Found server at ${foundUrl}`);
      const u = new URL(foundUrl);
      setIp(u.hostname);
      setPort(u.port);
      await ApiService.setBaseUrl(foundUrl);
      refreshData();
    } else {
      setScanStatus('No server found.');
    }
  };

  const selectSession = (id: string) => {
    ApiService.currentSessionId = id;
    Alert.alert("Session Selected", id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connection</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} value={ip} onChangeText={setIp} placeholder="IP Address" />
        <TextInput style={styles.input} value={port} onChangeText={setPort} placeholder="Port" keyboardType="numeric" />
      </View>
      <Button title="Save" onPress={saveSettings} />

      <View style={styles.spacer} />
      <Button title={isScanning ? "Scanning..." : "Auto Discover"} onPress={handleScan} disabled={isScanning} />
      <Text style={styles.status}>{scanStatus}</Text>

      <Text style={styles.header}>Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectSession(item.id)} style={styles.listItem}>
            <Text style={styles.listText}>{item.title || item.id}</Text>
            {ApiService.currentSessionId === item.id && <Text style={{color: 'green'}}> (Active)</Text>}
          </TouchableOpacity>
        )}
      />

      <Text style={styles.header}>Providers</Text>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, backgroundColor: 'white', borderRadius: 5 },
  spacer: { height: 10 },
  status: { marginTop: 5, color: '#666' },
  listItem: { padding: 15, backgroundColor: 'white', marginBottom: 5, borderRadius: 5, flexDirection: 'row' },
  listText: { fontSize: 16 }
});
