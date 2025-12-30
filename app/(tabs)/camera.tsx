import React from 'react';
import { StyleSheet, View } from 'react-native';
import VideoStreamScreenRealtime from '@/components/video-stream-screen-realtime';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <VideoStreamScreenRealtime />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
