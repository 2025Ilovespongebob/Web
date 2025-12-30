// components/video-stream-screen-realtime.tsx
// 진짜 스트리밍 방식 - takePictureAsync 사용 안함
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { PloggingBottomPanel } from './ui/plogging-bottom-panel';
import { useTFJSModel } from '../hooks/use-tfjs-model';

const TensorCamera = cameraWithTensors(CameraView);
const { width, height } = Dimensions.get('window');

const leftArrowSvg = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.22678 8.60179C5.17441 8.65404 5.13284 8.71611 5.10449 8.78445C5.07614 8.85279 5.06152 8.92605 5.06152 9.00004C5.06152 9.07403 5.07614 9.14729 5.10449 9.21563C5.13284 9.28396 5.17441 9.34604 5.22678 9.39829L11.9768 16.1483C12.0824 16.2539 12.2257 16.3132 12.375 16.3132C12.5244 16.3132 12.6677 16.2539 12.7733 16.1483C12.8789 16.0427 12.9382 15.8994 12.9382 15.75C12.9382 15.6007 12.8789 15.4574 12.7733 15.3518L6.42041 9.00004L12.7733 2.64829C12.8789 2.54267 12.9382 2.39941 12.9382 2.25004C12.9382 2.10067 12.8789 1.95741 12.7733 1.85179C12.6677 1.74617 12.5244 1.68683 12.375 1.68683C12.2257 1.68683 12.0824 1.74617 11.9768 1.85179L5.22678 8.60179Z" fill="#000000" stroke="#000000"/>
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

export default function VideoStreamScreenRealtime() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [showDetection, setShowDetection] = useState(false);
  const [totalDetections, setTotalDetections] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  
  const { model, isReady, error } = useTFJSModel();
  const isProcessingRef = useRef(false);
  const frameCountRef = useRef(0);

  console.log('🎬 [스트리밍] 컴포넌트 렌더링');
  console.log('  - 카메라 권한:', permission?.granted);
  console.log('  - 모델 준비:', isReady);

  // 실시간 스트리밍 처리 (파이썬의 while True 루프)
  const handleCameraStream = (images: IterableIterator<tf.Tensor3D>) => {
    console.log('📹 [스트리밍] 카메라 스트림 시작!');
    
    const loop = async () => {
      // 파이썬의 ret, frame = cap.read()
      const nextFrame = images.next().value;
      
      if (nextFrame && model && isReady && !isProcessingRef.current) {
        isProcessingRef.current = true;
        
        try {
          // 전처리: 이미 320x320으로 리사이징됨
          const batched = nextFrame.expandDims(0);
          const normalized = batched.div(255.0);
          
          // 추론 실행
          const predictions = await model.executeAsync(normalized);
          
          // 출력 처리
          let detections: any[] = [];
          if (Array.isArray(predictions)) {
            const mainOutput = predictions[0] as tf.Tensor;
            detections = await processYOLOOutput(mainOutput);
            predictions.forEach((pred) => pred.dispose());
          } else {
            detections = await processYOLOOutput(predictions as tf.Tensor);
            (predictions as tf.Tensor).dispose();
          }
          
          // 메모리 정리
          batched.dispose();
          normalized.dispose();

          // 통계 업데이트
          frameCountRef.current += 1;
          setFrameCount(frameCountRef.current);

          if (detections.length > 0) {
            console.log(`🎯 [스트리밍] 쓰레기 ${detections.length}개 탐지!`);
            setDetectionCount(detections.length);
            setShowDetection(true);
            setTotalDetections(prev => prev + detections.length);
            
            setTimeout(() => setShowDetection(false), 2000);
          }

          // 10프레임마다 통계
          if (frameCountRef.current % 10 === 0) {
            console.log(`📊 [스트리밍] 프레임: ${frameCountRef.current}, 총 탐지: ${totalDetections}개`);
          }
        } catch (error) {
          console.error('❌ [스트리밍] 처리 오류:', error);
        } finally {
          // 프레임 dispose
          tf.dispose(nextFrame);
          isProcessingRef.current = false;
        }
      } else {
        // 프레임만 dispose
        if (nextFrame) {
          tf.dispose(nextFrame);
        }
      }

      // 다음 프레임 즉시 요청 (부드러운 영상의 핵심)
      requestAnimationFrame(loop);
    };

    loop();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.Blue3} />
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

  console.log('✅ [스트리밍] TensorCamera 렌더링');

  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        facing="back"
        onReady={handleCameraStream}
        autorender={true}
        resizeHeight={320}
        resizeWidth={320}
        resizeDepth={3}
        cameraTextureHeight={height}
        cameraTextureWidth={width}
        useCustomShadersToResize={false}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('plogging' as never)}
        activeOpacity={0.8}
      >
        <SvgXml xml={leftArrowSvg} width={18} height={18} />
      </TouchableOpacity>

      {/* 모델 로딩 상태 */}
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>
            {error ? `AI 모델 로드 실패: ${error}` : 'AI 모델 로드 중...'}
          </Text>
        </View>
      )}

      {/* AI 상태 표시 */}
      <View style={styles.aiStatusContainer}>
        <View style={[
          styles.aiStatusBadge,
          isReady && styles.aiStatusActive,
          error && styles.aiStatusError,
        ]}>
          <View style={[
            styles.aiStatusDot,
            isReady && styles.aiStatusDotActive,
            error && styles.aiStatusDotError,
          ]} />
          <Text style={styles.aiStatusText}>
            {!isReady && !error && 'AI 로딩중'}
            {error && 'AI 오류'}
            {isReady && 'AI 스트리밍'}
          </Text>
        </View>
        
        {/* 통계 표시 */}
        {isReady && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>프레임: {frameCount}</Text>
            <Text style={styles.statsText}>탐지: {totalDetections}개</Text>
          </View>
        )}
      </View>

      {/* 쓰레기 인식 알림 */}
      {showDetection && (
        <View style={styles.detectionNotification}>
          <View style={styles.detectionContent}>
            <SvgXml xml={warningSvg} width={16} height={16} />
            <Text style={styles.detectionText}>
              쓰레기 {detectionCount}개 인식됨
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Panel */}
      <PloggingBottomPanel
        onStartStop={() => {}}
        collapsed={isPanelCollapsed}
        onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
      />
    </View>
  );
}

// YOLO 출력 처리
async function processYOLOOutput(predictions: tf.Tensor): Promise<any[]> {
  const detections: any[] = [];
  
  try {
    const data = await predictions.data();
    const shape = predictions.shape;
    
    // NMS 후 출력 형태: [batch, num_detections, 6]
    if (shape.length === 3 && shape[2] === 6) {
      const numDetections = shape[1];
      const confidenceThreshold = 0.3;
      
      for (let i = 0; i < numDetections; i++) {
        const offset = i * 6;
        
        const y1 = data[offset];
        const x1 = data[offset + 1];
        const y2 = data[offset + 2];
        const x2 = data[offset + 3];
        // const classId = data[offset + 4];
        const score = data[offset + 5];
        
        if (score > confidenceThreshold) {
          detections.push({
            bbox: [x1, y1, x2 - x1, y2 - y1],
            class: 'trash',
            score: score,
          });
        }
      }
    }
  } catch (err: any) {
    console.error('❌ [스트리밍] 출력 처리 실패:', err.message);
  }
  
  return detections;
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
    backgroundColor: colors.Blue3,
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
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  aiStatusContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 10,
  },
  aiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiStatusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  aiStatusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.Gray3,
  },
  aiStatusDotActive: {
    backgroundColor: 'white',
  },
  aiStatusDotError: {
    backgroundColor: 'white',
  },
  aiStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statsText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  detectionNotification: {
    position: 'absolute',
    top: 120,
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
