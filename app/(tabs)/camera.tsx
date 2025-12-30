import React from 'react';
import { StyleSheet, View } from 'react-native';
import VideoStreamScreen from '@/components/video-stream-screen';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <VideoStreamScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
