import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { PloggingBottomPanel } from './ui/plogging-bottom-panel';

const leftArrowSvg = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M5.22678 8.60179C5.17441 8.65404 5.13284 8.71611 5.10449 8.78445C5.07614 8.85279 5.06152 8.92605 5.06152 9.00004C5.06152 9.07403 5.07614 9.14729 5.10449 9.21563C5.13284 9.28396 5.17441 9.34604 5.22678 9.39829L11.9768 16.1483C12.0824 16.2539 12.2257 16.3132 12.375 16.3132C12.5244 16.3132 12.6677 16.2539 12.7733 16.1483C12.8789 16.0427 12.9382 15.8994 12.9382 15.75C12.9382 15.6007 12.8789 15.4574 12.7733 15.3518L6.42041 9.00004L12.7733 2.64829C12.8789 2.54267 12.9382 2.39941 12.9382 2.25004C12.9382 2.10067 12.8789 1.95741 12.7733 1.85179C12.6677 1.74617 12.5244 1.68683 12.375 1.68683C12.2257 1.68683 12.0824 1.74617 11.9768 1.85179L5.22678 8.60179Z"
    fill="#000000"
    stroke="#000000"
  />
</svg>
`;

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

// 백엔드 URL 설정 (여기를 수정하세요)
const DEFAULT_BACKEND_URL = 'http://your-backend-url.com/api/stream';

export default function VideoStreamScreen() {
  const navigation = useNavigation();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isStreaming, setIsStreaming] = useState(false);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 스트리밍 시작
    if (permission?.granted && cameraRef.current) {
      const timer = setTimeout(() => {
        startStreaming();
      }, 1000); // 1초 후에 시작 (카메라 준비 시간)
      
      return () => clearTimeout(timer);
    }
  }, [permission?.granted]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>권한 허용</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const captureAndSendFrame = async () => {
    if (!cameraRef.current || !isStreaming) return;

    try {
      // 사진 촬영
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // 화질 (0.1 ~ 1.0)
        base64: false, // base64 비활성화 (메모리 절약)
        skipProcessing: true, // 빠른 처리
      });

      if (!photo || !photo.uri) {
        console.log('Photo capture failed - no uri');
        return;
      }

      // 백엔드로 전송
      const formData = new FormData();
      formData.append('frame', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `frame_${Date.now()}.jpg`,
      } as any);

      // 타임스탬프 추가
      formData.append('timestamp', Date.now().toString());
      formData.append('frameNumber', frameCountRef.current.toString());

      // 백엔드로 POST 요청
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        frameCountRef.current += 1;
        setFrameCount(frameCountRef.current);
      } else {
        console.log('프레임 전송 실패:', response.status);
      }
    } catch (error) {
      // 에러를 조용히 처리 (너무 많은 로그 방지)
      if (frameCountRef.current % 10 === 0) {
        console.log('프레임 캡처/전송 오류 (10프레임마다 로그):', error);
      }
    }
  };

  const startStreaming = () => {
    if (!backendUrl.trim()) {
      console.log('No backend URL configured, skipping stream');
      return;
    }

    if (isStreaming) {
      console.log('Already streaming, skipping');
      return;
    }

    console.log('Starting streaming...');
    setIsStreaming(true);
    frameCountRef.current = 0;
    setFrameCount(0);
    setFps(0);

    // 프레임 전송 (초당 5프레임)
    streamIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 200); // 200ms = 5 FPS

    // FPS 계산
    let lastFrameCount = 0;
    fpsIntervalRef.current = setInterval(() => {
      const currentFps = frameCountRef.current - lastFrameCount;
      setFps(currentFps);
      lastFrameCount = frameCountRef.current;
    }, 1000);
  };

  const stopStreaming = () => {
    setIsStreaming(false);

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* 쓰레기 인식 알림 */}
        <View style={styles.detectionNotification}>
          <View style={styles.detectionContent}>
            <SvgXml xml={warningSvg} width={16} height={16} />
            <Text style={styles.detectionText}>쓰레기가 인식되었습니다</Text>
          </View>
        </View>

        {/* 상단 정보 */}
        <View style={styles.topBar}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, isStreaming && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isStreaming ? '스트리밍 중' : '대기 중'}
            </Text>
          </View>
          {isStreaming && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>프레임: {frameCount}</Text>
              <Text style={styles.statsText}>FPS: {fps}</Text>
            </View>
          )}
        </View>
      </CameraView>

      {/* Bottom Panel */}
      <PloggingBottomPanel
        onStartStop={() => Alert.alert('플로깅', '플로깅 중입니다')}
        collapsed={isPanelCollapsed}
        onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('plogging' as never)}
        activeOpacity={0.8}
      >
        <SvgXml xml={leftArrowSvg} width={18} height={18} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  detectionNotification: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  detectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
  },
  detectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#999',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statsText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
});
