import React from 'react';
import { StyleSheet, View } from 'react-native';
import SimpleDetectionScreen from '../simple-detection';

export default function SimpleDetectionTabScreen() {
  return (
    <View style={styles.container}>
      <SimpleDetectionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
