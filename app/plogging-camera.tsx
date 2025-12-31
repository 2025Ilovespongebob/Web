import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import RNFS from 'react-native-fs';
import { PloggingBottomPanel } from '../components/ui/plogging-bottom-panel';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import * as Haptics from 'expo-haptics';

const WS_URL = 'ws://10.150.150.224:8000/stream/ws';

const warningSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_155_123)">
<path d="M13.9898 18.8673C13.7219 19.1352 13.3585 19.2857 12.9796 19.2857H7.02025C6.64138 19.2857 6.278 19.1352 6.0101 18.8673L1.13265 13.9899C0.864743 13.722 0.714233 13.3586 0.714233 12.9797V7.02031C0.714233 6.64144 0.864743 6.27807 1.13265 6.01017L6.0101 1.13271C6.278 0.864804 6.64138 0.714294 7.02025 0.714294H12.9796C13.3585 0.714294 13.7219 0.864804 13.9898 1.13271L18.8672 6.01017C19.1351 6.27807 19.2857 6.64144 19.2857 7.02031V12.9797C19.2857 13.3586 19.1351 13.722 18.8672 13.9899L13.9898 18.8673Z" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 5.71429V10.3572" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.99997 14.2857C9.80272 14.2857 9.64282 14.1258 9.64282 13.9286C9.64282 13.7313 9.80272 13.5714 9.99997 13.5714" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 14.2857C10.1972 14.2857 10.3571 14.1258 10.3571 13.9286C10.3571 13.7313 10.1972 13.5714 10 13.5714" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_155_123">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
`;

export default function PloggingCameraScreen() {
  const navigation = useNavigation();
  const [permission, setPermission] = useState<string>('not-determined');
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [detections, setDetections] = useState<any[]>([]);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1440 });
  const [screenSize, setScreenSize] = useState(() => {
    const { width, height } = Dimensions.get('window');
    console.log('📱 [Init] 초기 화면 크기:', width, 'x', height);
    return { width, height };
  });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [prevDetectionCount, setPrevDetectionCount] = useState(0); // 이전 감지 개수 추적
  
  const device = useCameraDevice('back');
  const cameraRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<any>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentCount = detections.length;
    console.log('🎯 [Detections] 상태 변경:', currentCount, '개 (이전:', prevDetectionCount, '개)');
    
    if (currentCount > 0) {
      console.log('   첫 번째 감지:', detections[0]);
      
      // 쓰레기 감지 시 알림 표시
      if (!showNotification) {
        setShowNotification(true);
        
        Animated.timing(notificationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      
      // 감지 개수가 변경되었을 때 진동 (0 → N 또는 개수 변화)
      if (prevDetectionCount !== currentCount) {
        console.log('📳 [Alert] 감지 개수 변화 감지! 진동 피드백');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      // 쓰레기 없을 때 알림 숨김
      if (showNotification) {
        Animated.timing(notificationAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowNotification(false);
        });
      }
    }
    
    // 이전 개수 업데이트
    setPrevDetectionCount(currentCount);
  }, [detections]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
      
      if (status === 'granted') {
        setTimeout(() => {
          handleStart();
        }, 1000);
      }
    })();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('🧹 [Cleanup] 컴포넌트 언마운트');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const handleStart = () => {
    console.log('🔥 [Plogging Camera] 시작!!!');
    
    // 기존 WebSocket이 있으면 정리
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // 기존 interval이 있으면 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
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
              conf_threshold: 0.2
            }));
          }
          
          await RNFS.unlink(photo.path);
        } catch (error) {
          console.log('❌ 에러:', error);
        }
      }, 500); // 0.5초마다 실행
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.detections && data.detections.length > 0) {
        console.log(`📥 [Plogging] 감지: ${data.detection_count}개`);
        console.log('   이미지 크기:', imageSize.width, 'x', imageSize.height);
        console.log('   화면 크기:', screenSize.width, 'x', screenSize.height);
        
        // 단순 비율 스케일링
        const scaleX = screenSize.width / imageSize.width;
        const scaleY = screenSize.height / imageSize.height;
        
        console.log('   스케일 X:', scaleX.toFixed(3), 'Y:', scaleY.toFixed(3));
        
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
    
    wsRef.current.onclose = () => {
      console.log('🔌 [WebSocket] 연결 종료');
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
        console.log('📐 [Layout] 컨테이너 레이아웃 크기:', width, 'x', height);
        if (width > 0 && height > 0 && (screenSize.width !== width || screenSize.height !== height)) {
          console.log('✅ [Layout] 화면 크기 업데이트:', width, 'x', height);
          setScreenSize({ width, height });
        }
      }}
    >
      <View 
        style={StyleSheet.absoluteFill}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          console.log('📐 [Layout] 카메라 영역 크기:', width, 'x', height);
          if (width > 0 && height > 0 && (screenSize.width !== width || screenSize.height !== height)) {
            console.log('✅ [Layout] 화면 크기 업데이트 (카메라):', width, 'x', height);
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
          enableZoomGesture={false}
        />
      </View>
      
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
      
      {/* 쓰레기 감지 알림 */}
      {showNotification && (
        <Animated.View
          style={[
            styles.notification,
            {
              opacity: notificationAnim,
              transform: [
                {
                  translateY: notificationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <SvgXml xml={warningSvg} width={20} height={20} />
          <Text style={styles.notificationText}>쓰레기가 인식되었습니다</Text>
        </Animated.View>
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
  notification: {
    position: 'absolute',
    top: 60,
    left: '25%',
    transform: [{ translateX: -200 }],
    backgroundColor: colors.error,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 12,
    width:200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
});
