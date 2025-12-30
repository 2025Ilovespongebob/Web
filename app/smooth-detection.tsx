import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import RNFS from 'react-native-fs';

const WS_URL = 'ws://10.150.150.224:8000/stream/ws';

export default function SmoothDetectionScreen() {
  const [permission, setPermission] = useState<string>('not-determined');
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [detections, setDetections] = useState<any[]>([]);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1440 });
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false); // 캡처 중 표시
  
  const device = useCameraDevice('back');
  const cameraRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setScreenSize({ width, height });
    
    // 권한 요청
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
      
      if (status === 'granted') {
        setTimeout(() => {
          handleStart();
        }, 1000);
      }
    })();
  }, []);

  const handleStart = () => {
    console.log('🔥 [Smooth] 시작!!!');
    
    wsRef.current = new WebSocket(WS_URL);
    
    wsRef.current.onopen = () => {
      console.log('✅✅✅ [WebSocket] 연결 성공!!!');
      setIsRunning(true);
      
      // 2초마다 사진 촬영 (깜빡임 없음)
      intervalRef.current = setInterval(async () => {
        if (!cameraRef.current || !wsRef.current) return;
        
        try {
          setIsCapturing(true); // 캡처 시작
          console.log('📸 사진 촬영 시작...');
          
          // takePhoto는 깜빡임 없음!
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'speed',
            enableShutterSound: false,
          });
          
          console.log('✅ 사진 촬영 완료:', photo.path);
          
          // 파일을 base64로 읽기
          const base64 = await RNFS.readFile(photo.path, 'base64');
          
          console.log('✅ Base64 변환 완료');
          
          if (wsRef.current.readyState === WebSocket.OPEN) {
            setImageSize({ width: photo.width, height: photo.height });
            
            wsRef.current.send(JSON.stringify({
              frame: `data:image/jpeg;base64,${base64}`,
              conf_threshold: 0.5
            }));
            
            console.log('✅ 서버로 전송 완료');
          }
          
          // 파일 삭제
          await RNFS.unlink(photo.path);
          
          setIsCapturing(false); // 캡처 완료
        } catch (error) {
          console.log('❌ 에러:', error);
          setIsCapturing(false);
        }
      }, 2000);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.detections && data.detections.length > 0) {
        console.log(`📥 감지: ${data.detection_count}개`);
        
        const scaleX = screenSize.width / imageSize.width;
        const scaleY = screenSize.height / imageSize.height;
        
        const scaledDetections = data.detections.map((det: any) => ({
          ...det,
          bbox: {
            x1: det.bbox.x1 * scaleX,
            y1: det.bbox.y1 * scaleY,
            x2: det.bbox.x2 * scaleX,
            y2: det.bbox.y2 * scaleY,
          }
        }));
        
        setDetections(scaledDetections);
      } else {
        setDetections([]);
      }
      
      setCount(prev => prev + 1);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌❌❌ [WebSocket] 에러:', error);
    };
  };

  const handleStop = () => {
    console.log('⏹️ [Smooth] 중지');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wsRef.current) wsRef.current.close();
    setIsRunning(false);
    setCount(0);
    setDetections([]);
  };

  if (permission === 'not-determined') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>권한 확인 중...</Text>
      </View>
    );
  }

  if (permission !== 'granted') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한 필요</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={async () => {
            const status = await Camera.requestCameraPermission();
            setPermission(status);
          }}
        >
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      
      {/* 캡처 중 오버레이 (깜빡임 숨기기) */}
      {isCapturing && (
        <View style={styles.captureOverlay} pointerEvents="none">
          <View style={styles.scanLine} />
        </View>
      )}
      
      {/* 바운딩 박스 */}
      {detections.length > 0 && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {detections.map((det, idx) => {
            const width = det.bbox.x2 - det.bbox.x1;
            const height = det.bbox.y2 - det.bbox.y1;
            const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
            
            return (
              <G key={`${idx}-${det.bbox.x1}-${det.bbox.y1}`}>
                <Rect
                  x={det.bbox.x1}
                  y={det.bbox.y1}
                  width={width}
                  height={height}
                  stroke="#00FF00"
                  strokeWidth="3"
                  fill="transparent"
                />
                <Rect
                  x={det.bbox.x1}
                  y={det.bbox.y1 - 28}
                  width={label.length * 8 + 12}
                  height={28}
                  fill="#00FF00"
                  opacity={0.85}
                />
                <SvgText
                  x={det.bbox.x1 + 6}
                  y={det.bbox.y1 - 10}
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
      
      <View style={styles.overlay}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isRunning ? `🎥 감지: ${detections.length}개 (${count})` : '⏸️ 대기 중'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, isRunning && styles.stopButton]}
          onPress={isRunning ? handleStop : handleStart}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '⏹️ 중지' : '▶️ 시작'}
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
    fontSize: 20,
    marginBottom: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  statusContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
