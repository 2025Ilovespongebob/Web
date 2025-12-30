# AI 서버 API 사용 가이드

## 개요
AI 서버와 통신하여 쓰레기 감지를 수행하는 API입니다.

## 설정

### 1. Axios 인스턴스 (`lib/axios.ts`)
- `axiosInstance`: 백엔드 API 서버
- `aiServerInstance`: AI 감지 서버

### 2. URL 설정
```typescript
// 개발 환경
const BACKEND_BASE_URL = 'http://localhost:3000/api';
const AI_SERVER_BASE_URL = 'http://localhost:5000/api';

// 프로덕션 환경
const BACKEND_BASE_URL = 'https://your-production-api.com/api';
const AI_SERVER_BASE_URL = 'https://your-ai-server.com/api';
```

## 사용 예제

### 1. 단일 이미지 감지

```tsx
import { useDetectTrash, imageToBase64 } from '@/hooks/use-ai-api';
import { BoundingBoxOverlay, Detection } from '@/components/ui/bounding-box-overlay';

function ImageDetection() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const detectMutation = useDetectTrash();

  const handleDetect = async (imageUri: string) => {
    try {
      // 이미지를 Base64로 변환
      const base64Image = await imageToBase64(imageUri);
      
      // AI 서버에 감지 요청
      const result = await detectMutation.mutateAsync(base64Image);
      
      // 감지 결과를 바운딩 박스 형식으로 변환
      const newDetections: Detection[] = result.detections.map((det, index) => ({
        id: `${Date.now()}-${index}`,
        x: det.x,
        y: det.y,
        width: det.width,
        height: det.height,
        label: det.class_name,
        confidence: det.confidence,
      }));
      
      setDetections(newDetections);
    } catch (error) {
      console.error('Detection failed:', error);
      Alert.alert('오류', '쓰레기 감지에 실패했습니다.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: imageUri }} style={{ flex: 1 }} />
      <BoundingBoxOverlay detections={detections} />
      
      {detectMutation.isPending && (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}
```

### 2. 실시간 스트리밍 감지

```tsx
import { useProcessStreamFrame } from '@/hooks/use-ai-api';
import { useRef, useState } from 'react';

function VideoStreamDetection() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const processMutation = useProcessStreamFrame();
  const cameraRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  const captureAndDetect = async () => {
    if (isProcessingRef.current || !cameraRef.current) return;
    
    try {
      isProcessingRef.current = true;
      
      // 카메라에서 프레임 캡처
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      
      // AI 서버에 프레임 전송
      const result = await processMutation.mutateAsync({
        image: photo.base64,
        timestamp: Date.now(),
      });
      
      // 감지 결과 업데이트
      const newDetections: Detection[] = result.detections.map((det, index) => ({
        id: `${Date.now()}-${index}`,
        x: det.x,
        y: det.y,
        width: det.width,
        height: det.height,
        label: det.class_name,
        confidence: det.confidence,
      }));
      
      setDetections(newDetections);
    } catch (error) {
      console.error('Stream detection error:', error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  // 주기적으로 감지 수행 (예: 500ms마다)
  useEffect(() => {
    const interval = setInterval(captureAndDetect, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      <BoundingBoxOverlay detections={detections} />
    </View>
  );
}
```

### 3. 배치 이미지 처리

```tsx
import { useDetectTrashBatch } from '@/hooks/use-ai-api';

function BatchDetection() {
  const batchMutation = useDetectTrashBatch();

  const handleBatchDetect = async (imageUris: string[]) => {
    try {
      // 모든 이미지를 Base64로 변환
      const base64Images = await Promise.all(
        imageUris.map(uri => imageToBase64(uri))
      );
      
      // AI 서버에 배치 요청
      const results = await batchMutation.mutateAsync(base64Images);
      
      console.log('Batch results:', results);
    } catch (error) {
      console.error('Batch detection failed:', error);
    }
  };

  return (
    <Button 
      onPress={() => handleBatchDetect(imageUris)}
      disabled={batchMutation.isPending}
    >
      {batchMutation.isPending ? '처리 중...' : '배치 감지'}
    </Button>
  );
}
```

### 4. AI 서버 헬스 체크

```tsx
import { useAIHealthCheck } from '@/hooks/use-ai-api';

function HealthCheck() {
  const healthMutation = useAIHealthCheck();

  const checkHealth = async () => {
    try {
      const result = await healthMutation.mutateAsync();
      console.log('AI Server status:', result.status);
      console.log('AI Server version:', result.version);
    } catch (error) {
      console.error('AI Server is down:', error);
    }
  };

  return (
    <Button onPress={checkHealth}>
      서버 상태 확인
    </Button>
  );
}
```

## 좌표 변환

### 정규화된 좌표 → 픽셀 좌표

```tsx
import { normalizedToPixel } from '@/hooks/use-ai-api';

// AI 서버가 0-1 사이의 정규화된 좌표를 반환하는 경우
const normalizedBox = { x: 0.5, y: 0.3, width: 0.2, height: 0.2 };
const imageWidth = 1920;
const imageHeight = 1080;

const pixelBox = normalizedToPixel(normalizedBox, imageWidth, imageHeight);
// { x: 960, y: 324, width: 384, height: 216 }
```

### 픽셀 좌표 → 정규화된 좌표

```tsx
import { pixelToNormalized } from '@/hooks/use-ai-api';

const pixelBox = { x: 960, y: 324, width: 384, height: 216 };
const imageWidth = 1920;
const imageHeight = 1080;

const normalizedBox = pixelToNormalized(pixelBox, imageWidth, imageHeight);
// { x: 0.5, y: 0.3, width: 0.2, height: 0.2 }
```

## 성능 최적화

### 1. 프레임 스킵

```tsx
const frameSkipRef = useRef(0);
const SKIP_FRAMES = 3; // 3프레임마다 1번 감지

const captureAndDetect = async () => {
  frameSkipRef.current++;
  
  if (frameSkipRef.current % SKIP_FRAMES !== 0) {
    return; // 프레임 스킵
  }
  
  // 감지 수행
  // ...
};
```

### 2. 이미지 품질 조절

```tsx
const photo = await cameraRef.current.takePictureAsync({
  base64: true,
  quality: 0.5, // 낮은 품질로 전송 속도 향상
  skipProcessing: true,
});
```

### 3. 신뢰도 필터링

```tsx
const filteredDetections = result.detections
  .filter(det => det.confidence > 0.7) // 신뢰도 70% 이상만
  .map((det, index) => ({
    id: `${Date.now()}-${index}`,
    x: det.x,
    y: det.y,
    width: det.width,
    height: det.height,
    label: det.class_name,
    confidence: det.confidence,
  }));
```

### 4. 디바운싱

```tsx
import { useRef } from 'react';

const lastDetectionRef = useRef(0);
const DETECTION_INTERVAL = 500; // 500ms 간격

const captureAndDetect = async () => {
  const now = Date.now();
  if (now - lastDetectionRef.current < DETECTION_INTERVAL) {
    return; // 너무 빠른 요청 방지
  }
  
  lastDetectionRef.current = now;
  // 감지 수행
  // ...
};
```

## 에러 처리

```tsx
const detectMutation = useDetectTrash();

const handleDetect = async (imageBase64: string) => {
  try {
    const result = await detectMutation.mutateAsync(imageBase64);
    // 성공 처리
  } catch (error: any) {
    if (error.response) {
      // AI 서버가 에러 응답을 반환
      console.error('AI Server error:', error.response.data);
      Alert.alert('오류', error.response.data.message || '감지 실패');
    } else if (error.request) {
      // 요청은 보냈지만 응답 없음
      console.error('No response from AI server');
      Alert.alert('오류', 'AI 서버에 연결할 수 없습니다.');
    } else {
      // 요청 설정 중 에러
      console.error('Request setup error:', error.message);
      Alert.alert('오류', '요청 처리 중 오류가 발생했습니다.');
    }
  }
};
```

## API 엔드포인트

### AI 서버

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect` | 단일 이미지 감지 |
| POST | `/stream/detect` | 스트리밍 프레임 처리 |
| POST | `/detect/batch` | 배치 이미지 처리 |
| GET | `/health` | 서버 상태 확인 |

### 요청 예시

```json
// POST /detect
{
  "image": "base64_encoded_image_string"
}

// POST /stream/detect
{
  "image": "base64_encoded_image_string",
  "timestamp": 1703923200000
}

// POST /detect/batch
{
  "images": [
    "base64_image_1",
    "base64_image_2",
    "base64_image_3"
  ]
}
```

### 응답 예시

```json
{
  "detections": [
    {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 150,
      "class_name": "쓰레기",
      "confidence": 0.95
    }
  ],
  "inference_time": 0.123,
  "image_size": {
    "width": 1920,
    "height": 1080
  }
}
```
