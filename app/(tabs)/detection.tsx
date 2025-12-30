import React from 'react';
import { StyleSheet, View } from 'react-native';
import RealtimeDetectionScreen from '../realtime-detection';

export default function DetectionTabScreen() {
  return (
    <View style={styles.container}>
      <RealtimeDetectionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
