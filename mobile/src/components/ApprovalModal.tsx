import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  request: { id: string, title?: string, description?: string } | null;
  onRespond: (response: 'once' | 'always' | 'reject') => void;
}

export default function ApprovalModal({ visible, request, onRespond }: Props) {
  if (!request) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Permission Request</Text>
          <Text style={styles.message}>{request.title || "Agent is requesting permission"}</Text>
          {request.description && <Text style={styles.description}>{request.description}</Text>}

          <View style={styles.buttonRow}>
            <Button title="Reject" color="red" onPress={() => onRespond('reject')} />
            <Button title="Once" onPress={() => onRespond('once')} />
            <Button title="Always" onPress={() => onRespond('always')} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
