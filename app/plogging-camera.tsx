import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import RNFS from 'react-native-fs';
import { PloggingBottomPanel } from '../components/ui/plogging-bottom-panel';
import { useNavigation } from '@react-navigation/native';

const WS_URL = 'ws://10.150.150.224:8000/stream/ws';

export default function PloggingCameraScreen() {
  const navigation = useNavigation();
  const [permission, setPermission] = useState<string>('not-determined');
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [detections, setDetections] = useState<any[]>([]);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1440 });
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  const device = useCameraDevice('back');
  const cameraRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    console.log('🎯 [Detections] 상태 변경:', detections.length, '개');
    if (detections.length > 0) {
      console.log('   첫 번째 감지:', detections[0]);
    }
  }, [detections]);

  useEffect(() => {
    const { width, height } = Dimensions.get('screen'); // window -> screen으로 변경
    console.log('📱 [Screen Size] 초기 화면 크기:', width, 'x', height);
    setScreenSize({ width, height });
    
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
      
      if (status === 'granted') {
        setTimeout(() => {
          handleStart();
        }, 1000);
      }
    })();
    
    // 화면 크기 변경 감지
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      console.log('📱 [Screen Size] 화면 크기 변경:', screen.width, 'x', screen.height);
      setScreenSize({ width: screen.width, height: screen.height });
    });
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleStart = () => {
    console.log('🔥 [Plogging Camera] 시작!!!');
    
    wsRef.current = new WebSocket(WS_URL);
    
    wsRef.current.onopen = () => {
      console.log('✅✅✅ [WebSocket] 연결 성공!!!');
      setIsRunning(true);
      
      intervalRef.current = setInterval(async () => {
        if (!cameraRef.current || !wsRef.current) return;
        
        try {
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'speed',
            enableShutterSound: false,
          });
          
          const base64 = await RNFS.readFile(photo.path, 'base64');
          
          if (wsRef.current.readyState === WebSocket.OPEN) {
            setImageSize({ width: photo.width, height: photo.height });
            
            wsRef.current.send(JSON.stringify({
              frame: `data:image/jpeg;base64,${base64}`,
              conf_threshold: 0.5
            }));
          }
          
          await RNFS.unlink(photo.path);
        } catch (error) {
          console.log('❌ 에러:', error);
        }
      }, 2000);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.detections && data.detections.length > 0) {
        console.log(`📥 [Plogging] 감지: ${data.detection_count}개`);
        console.log('   이미지 크기:', imageSize.width, 'x', imageSize.height);
        console.log('   화면 크기:', screenSize.width, 'x', screenSize.height);
        
        const scaleX = screenSize.width / imageSize.width;
        const scaleY = screenSize.height / imageSize.height;
        
        console.log('   스케일:', scaleX.toFixed(3), 'x', scaleY.toFixed(3));
        
        const scaledDetections = data.detections.map((det: any) => {
          const scaled = {
            ...det,
            bbox: {
              x1: det.bbox.x1 * scaleX,
              y1: det.bbox.y1 * scaleY,
              x2: det.bbox.x2 * scaleX,
              y2: det.bbox.y2 * scaleY,
            }
          };
          
          console.log('   원본 bbox:', det.bbox);
          console.log('   스케일 bbox:', scaled.bbox);
          
          return scaled;
        });
        
        setDetections(scaledDetections);
        console.log('   ✅ 바운딩 박스 설정 완료:', scaledDetections.length, '개');
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
    console.log('⏹️ [Plogging Camera] 중지');
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
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('📐 [Layout] 실제 레이아웃 크기:', width, 'x', height);
        if (width > 0 && height > 0) {
          setScreenSize({ width, height });
        }
      }}
    >
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      
      {/* 바운딩 박스 */}
      {detections.length > 0 && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {detections.map((det, idx) => {
            const width = det.bbox.x2 - det.bbox.x1;
            const height = det.bbox.y2 - det.bbox.y1;
            const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
            
            console.log(`🎨 [Render] 박스 ${idx + 1}:`, {
              x: det.bbox.x1,
              y: det.bbox.y1,
              width,
              height,
              label
            });
            
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
      
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      {/* Bottom Panel */}
      <PloggingBottomPanel
        onStartStop={() => {}}
        collapsed={isPanelCollapsed}
        onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
      />
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
  button: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
});
