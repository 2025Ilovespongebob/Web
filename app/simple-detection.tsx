import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';

const AI_SERVER_URL = 'ws://10.150.1.57.79:8000/stream/ws';

export default function SimpleDetectionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRunning, setIsRunning] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [stats, setStats] = useState({ sent: 0, received: 0 });
  
  const cameraRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<any>(null);

  console.log('🎬 [SimpleDetection] 렌더링');
  console.log('   └─ 권한 상태:', permission?.granted);
  console.log('   └─ 실행 중:', isRunning);

  useEffect(() => {
    console.log('🔍 [Permission] 권한 확인 중...');
    if (!permission) {
      console.log('⏳ [Permission] 권한 요청 중...');
      requestPermission();
    } else {
      console.log('✅ [Permission] 권한 상태:', permission.granted ? '허용됨' : '거부됨');
    }
  }, [permission]);

  useEffect(() => {
    if (isRunning) {
      startDetection();
    } else {
      stopDetection();
    }
    
    return () => stopDetection();
  }, [isRunning]);

  const startDetection = () => {
    console.log('🚀 [Start] 디텍션 시작');
    
    // WebSocket 연결
    wsRef.current = new WebSocket(AI_SERVER_URL);
    
    wsRef.current.onopen = () => {
      console.log('✅ [WebSocket] 연결 성공');
      Alert.alert('연결 성공', 'AI 서버에 연결되었습니다');
      
      // 프레임 전송 시작
      intervalRef.current = setInterval(captureAndSend, 200); // 5fps
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📥 [Response] 응답 수신:', data.detection_count, '개');
        
        if (data.detections) {
          setDetections(data.detections);
          setStats(prev => ({ ...prev, received: prev.received + 1 }));
        }
      } catch (error) {
        console.error('❌ [Parse] 에러:', error);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌ [WebSocket] 에러:', error);
      Alert.alert('연결 실패', 'AI 서버에 연결할 수 없습니다');
    };
    
    wsRef.current.onclose = () => {
      console.log('🔌 [WebSocket] 연결 종료');
    };
  };

  const stopDetection = () => {
    console.log('⏹️ [Stop] 디텍션 중지');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setDetections([]);
  };

  const captureAndSend = async () => {
    if (!cameraRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      console.log('📸 [Capture] 프레임 캡처 중...');
      
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        skipProcessing: true,
      });
      
      if (photo.base64) {
        console.log('📤 [Send] 프레임 전송');
        
        wsRef.current.send(JSON.stringify({
          frame: `data:image/jpeg;base64,${photo.base64}`,
          conf_threshold: 0.5
        }));
        
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
      }
    } catch (error) {
      console.error('❌ [Capture] 에러:', error);
    }
  };

  if (!permission) {
    console.log('⏳ [Render] 권한 로딩 중...');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    console.log('⚠️ [Render] 권한 없음');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('✅ [Render] 카메라 렌더링');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 카메라 */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => {
          console.log('📷 [Camera] 카메라 준비 완료');
        }}
        onMountError={(error) => {
          console.error('❌ [Camera] 마운트 에러:', error);
        }}
      />
      
      {/* 디텍션 오버레이 */}
      {detections.length > 0 && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {detections.map((det, idx) => {
            const width = det.bbox.x2 - det.bbox.x1;
            const height = det.bbox.y2 - det.bbox.y1;
            const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
            
            return (
              <G key={idx}>
                <Rect
                  x={det.bbox.x1}
                  y={det.bbox.y1}
                  width={width}
                  height={height}
                  stroke="#FF6B6B"
                  strokeWidth="3"
                  fill="transparent"
                />
                <Rect
                  x={det.bbox.x1}
                  y={det.bbox.y1 - 25}
                  width={label.length * 8 + 10}
                  height={25}
                  fill="#FF6B6B"
                  opacity={0.8}
                />
                <SvgText
                  x={det.bbox.x1 + 5}
                  y={det.bbox.y1 - 8}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
      
      {/* 상태 표시 */}
      <View style={styles.statusBar}>
        <View style={[styles.dot, { backgroundColor: isRunning ? '#4ECDC4' : '#FF6B6B' }]} />
        <Text style={styles.statusText}>
          {isRunning ? '실행 중' : '중지됨'}
        </Text>
        {isRunning && (
          <Text style={styles.statsText}>
            전송: {stats.sent} | 응답: {stats.received} | 감지: {detections.length}
          </Text>
        )}
      </View>
      
      {/* 컨트롤 버튼 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonActive]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '⏸️ 중지' : '▶️ 시작'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  statusBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 'auto',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
