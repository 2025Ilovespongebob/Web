import { useEffect, useRef, useState } from 'react';

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface UseDetectionWebSocketReturn {
  detections: Detection[];
  isConnected: boolean;
  sendFrame: (frameBase64: string) => void;
  frameCount: number;
  responseCount: number;
}

export const useDetectionWebSocket = (serverUrl: string): UseDetectionWebSocketReturn => {
  const ws = useRef<WebSocket | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const frameCountRef = useRef(0);
  const responseCountRef = useRef(0);
  const lastSendTimeRef = useRef(0);

  useEffect(() => {
    console.log('🔄 [WebSocket] 연결 시도:', serverUrl);
    
    // WebSocket 연결
    ws.current = new WebSocket(serverUrl);
    
    ws.current.onopen = () => {
      console.log('✅ [WebSocket] 연결 성공');
      console.log('📡 [WebSocket] ReadyState:', ws.current?.readyState);
      setIsConnected(true);
    };
    
    ws.current.onmessage = (event) => {
      responseCountRef.current += 1;
      const responseTime = Date.now() - lastSendTimeRef.current;
      console.log(`📥 [WebSocket] 응답 수신 #${responseCountRef.current} (지연: ${responseTime}ms)`);
      
      try {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          console.error('❌ [Backend] 에러:', data.error);
          return;
        }
        
        if (data.detections) {
          console.log(`🎯 [Detection] ${data.detection_count}개 감지됨`);
          data.detections.forEach((det: Detection, idx: number) => {
            console.log(
              `  └─ [${idx + 1}] ${det.class_name} (${(det.confidence * 100).toFixed(1)}%) ` +
              `at [${det.bbox.x1.toFixed(0)}, ${det.bbox.y1.toFixed(0)}]`
            );
          });
          setDetections(data.detections);
        } else {
          console.log('ℹ️ [Detection] 감지된 객체 없음');
          setDetections([]);
        }
      } catch (error) {
        console.error('❌ [WebSocket] JSON 파싱 실패:', error);
      }
    };
    
    ws.current.onerror = (error) => {
      console.error('❌ [WebSocket] 에러 발생:', error);
      console.log('🔍 [Debug] 서버 URL 확인:', serverUrl);
    };
    
    ws.current.onclose = (event) => {
      console.log('🔌 [WebSocket] 연결 종료');
      console.log(`   └─ Code: ${event.code}, Reason: ${event.reason || '없음'}`);
      console.log(`📊 [Stats] 전송: ${frameCountRef.current}, 응답: ${responseCountRef.current}`);
      setIsConnected(false);
    };
    
    return () => {
      console.log('🧹 [WebSocket] 정리 중...');
      ws.current?.close();
    };
  }, [serverUrl]);
  
  const sendFrame = (frameBase64: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      frameCountRef.current += 1;
      lastSendTimeRef.current = Date.now();
      const frameSize = (frameBase64.length * 0.75 / 1024).toFixed(1); // KB
      console.log(`📤 [Frame] #${frameCountRef.current} 전송 (${frameSize}KB)`);
      
      ws.current.send(JSON.stringify({
        frame: frameBase64,
        conf_threshold: 0.5
      }));
    } else {
      console.warn('⚠️ [WebSocket] 연결되지 않음 (ReadyState:', ws.current?.readyState, ')');
    }
  };
  
  return { 
    detections, 
    isConnected, 
    sendFrame,
    frameCount: frameCountRef.current,
    responseCount: responseCountRef.current
  };
};
