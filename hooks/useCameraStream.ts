import { useRef, useEffect, useState } from 'react';
import { AppState } from 'react-native';

interface UseCameraStreamOptions {
  onFrame: (frameBase64: string) => void;
  fps?: number;
  quality?: number;
  enabled?: boolean;
}

export const useCameraStream = ({
  onFrame,
  fps = 5,
  quality = 0.5,
  enabled = true
}: UseCameraStreamOptions) => {
  const cameraRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const frameNumberRef = useRef(0);
  const skippedFramesRef = useRef(0);
  const processedFramesRef = useRef(0);

  const captureFrame = async () => {
    const startTime = Date.now();
    
    if (cameraRef.current) {
      try {
        console.log('📸 [Camera] 프레임 캡처 시작...');
        
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality,
          skipProcessing: true
        });
        
        const captureTime = Date.now() - startTime;
        const frameSize = photo.base64 ? (photo.base64.length * 0.75 / 1024).toFixed(1) : '0';
        
        console.log(`✅ [Camera] 캡처 완료 (${captureTime}ms, ${frameSize}KB)`);
        console.log(`   └─ 해상도: ${photo.width}x${photo.height}`);
        
        return photo.base64 || null;
      } catch (error) {
        console.error('❌ [Camera] 캡처 실패:', error);
        return null;
      }
    } else {
      console.warn('⚠️ [Camera] 카메라 참조 없음');
      return null;
    }
  };

  const startStreaming = () => {
    if (intervalRef.current) return;

    console.log(`▶️ [Stream] 스트리밍 시작 (${fps}fps, 품질: ${quality * 100}%)`);
    
    const interval = 1000 / fps;
    
    intervalRef.current = setInterval(async () => {
      if (isProcessingRef.current) {
        skippedFramesRef.current++;
        console.log(`⏭️ [Stream] 프레임 스킵 (처리 중) - 총 스킵: ${skippedFramesRef.current}`);
        return;
      }
      
      frameNumberRef.current++;
      console.log(`\n🔄 [Stream] 프레임 #${frameNumberRef.current} 처리 시작 (처리됨: ${processedFramesRef.current}, 스킵: ${skippedFramesRef.current})`);
      
      isProcessingRef.current = true;
      const startTime = Date.now();
      
      const frameBase64 = await captureFrame();
      
      if (frameBase64) {
        onFrame(`data:image/jpeg;base64,${frameBase64}`);
        processedFramesRef.current++;
        console.log(`✅ [Stream] 프레임 #${frameNumberRef.current} 전송 완료 (${Date.now() - startTime}ms)`);
        
        // 성능 통계 출력 (10프레임마다)
        if (processedFramesRef.current % 10 === 0) {
          const total = processedFramesRef.current + skippedFramesRef.current;
          const skipRate = ((skippedFramesRef.current / total) * 100).toFixed(1);
          console.log(`📊 [Stats] 처리율: ${processedFramesRef.current}/${total} (스킵률: ${skipRate}%)`);
        }
      } else {
        console.warn(`⚠️ [Stream] 프레임 #${frameNumberRef.current} 스킵 (캡처 실패)`);
      }
      
      isProcessingRef.current = false;
    }, interval);
  };

  const stopStreaming = () => {
    if (intervalRef.current) {
      console.log('⏸️ [Stream] 스트리밍 중지');
      console.log(`📊 [Stats] 최종 통계 - 처리: ${processedFramesRef.current}, 스킵: ${skippedFramesRef.current}`);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (enabled) {
      startStreaming();
    } else {
      stopStreaming();
    }

    return () => {
      stopStreaming();
    };
  }, [enabled, fps, quality]);

  // AppState 리스너
  useEffect(() => {
    console.log('👀 [AppState] 리스너 등록');
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log(`🔄 [AppState] 상태 변경: ${AppState.currentState} → ${nextAppState}`);
      
      if (nextAppState === 'background') {
        console.log('⏸️ [Stream] 백그라운드 진입 - 스트리밍 중지');
        stopStreaming();
      } else if (nextAppState === 'active' && enabled) {
        console.log('▶️ [Stream] 포그라운드 복귀 - 스트리밍 재시작');
        startStreaming();
      }
    });
    
    return () => {
      console.log('🧹 [AppState] 리스너 제거');
      subscription.remove();
    };
  }, [enabled]);

  return {
    cameraRef,
    isStreaming: intervalRef.current !== null,
    processedFrames: processedFramesRef.current,
    skippedFrames: skippedFramesRef.current
  };
};
