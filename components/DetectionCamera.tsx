import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DetectionOverlay } from './DetectionOverlay';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useDetectionWebSocket } from '@/hooks/useDetectionWebSocket';
import { scaleDetections } from '@/lib/detection-utils';

interface DetectionCameraProps {
  serverUrl: string;
  enabled?: boolean;
  fps?: number;
  quality?: number;
}

export const DetectionCamera: React.FC<DetectionCameraProps> = ({
  serverUrl,
  enabled = true,
  fps = 5,
  quality = 0.5
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [scaledDetections, setScaledDetections] = useState<any[]>([]);

  const { detections, isConnected, sendFrame } = useDetectionWebSocket(serverUrl);
  
  const { cameraRef, isStreaming, processedFrames, skippedFrames } = useCameraStream({
    onFrame: sendFrame,
    fps,
    quality,
    enabled: enabled && isConnected
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (detections.length > 0) {
      // 좌표 변환 (원본 이미지 크기는 캡처 시 로그에서 확인 가능)
      // 여기서는 카메라 해상도를 가정 (실제로는 캡처된 이미지 크기 사용)
      const originalSize = { width: 640, height: 480 };
      const displaySize = { width: dimensions.width, height: dimensions.height };
      
      const scaled = scaleDetections(detections, originalSize, displaySize);
      setScaledDetections(scaled);
    } else {
      setScaledDetections([]);
    }
  }, [detections, dimensions]);

  useEffect(() => {
    if (!permission) {
      console.log('📋 [Camera] 권한 요청 중...');
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    console.log('⏳ [Camera] 권한 로딩 중...');
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    console.warn('⚠️ [Camera] 카메라 권한 없음');
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>카메라 권한이 필요합니다</Text>
        <Text style={styles.subText}>설정에서 카메라 권한을 허용해주세요</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />
      
      <DetectionOverlay
        detections={scaledDetections}
        width={dimensions.width}
        height={dimensions.height}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: '#aaa',
    fontSize: 14,
  },
});
