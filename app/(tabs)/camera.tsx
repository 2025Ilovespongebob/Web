import React from 'react';
import { StyleSheet, View } from 'react-native';
import SmoothDetectionScreen from '../smooth-detection';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <SmoothDetectionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
