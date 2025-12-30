# Bounding Box 사용 가이드

## 개요
객체 감지 결과를 화면에 표시하기 위한 바운딩 박스 컴포넌트입니다.

## 컴포넌트

### 1. BoundingBox
단일 바운딩 박스를 표시하는 컴포넌트

### 2. BoundingBoxOverlay
여러 개의 바운딩 박스를 관리하는 오버레이 컴포넌트

## 사용 예제

### 기본 사용법

```tsx
import { BoundingBox } from '@/components/ui/bounding-box';

function CameraView() {
  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }}>
        {/* 카메라 뷰 */}
      </CameraView>
      
      {/* 바운딩 박스 */}
      <BoundingBox
        x={100}
        y={200}
        width={150}
        height={150}
        label="쓰레기"
        confidence={0.95}
      />
    </View>
  );
}
```

### 여러 개의 바운딩 박스

```tsx
import { BoundingBoxOverlay, Detection } from '@/components/ui/bounding-box-overlay';

function CameraView() {
  const [detections, setDetections] = useState<Detection[]>([
    {
      id: '1',
      x: 100,
      y: 200,
      width: 150,
      height: 150,
      label: '쓰레기',
      confidence: 0.95,
    },
    {
      id: '2',
      x: 300,
      y: 400,
      width: 120,
      height: 120,
      label: '쓰레기',
      confidence: 0.87,
    },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }}>
        {/* 카메라 뷰 */}
      </CameraView>
      
      {/* 바운딩 박스 오버레이 */}
      <BoundingBoxOverlay detections={detections} />
    </View>
  );
}
```

### 백엔드 응답 처리

```tsx
import { useState } from 'react';
import { BoundingBoxOverlay, Detection } from '@/components/ui/bounding-box-overlay';

function VideoStreamScreen() {
  const [detections, setDetections] = useState<Detection[]>([]);

  // 백엔드에서 받은 감지 결과 처리
  const handleDetectionResponse = (response: any) => {
    const newDetections: Detection[] = response.detections.map((det: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      x: det.bbox[0], // x 좌표
      y: det.bbox[1], // y 좌표
      width: det.bbox[2], // 너비
      height: det.bbox[3], // 높이
      label: det.class_name || '쓰레기',
      confidence: det.confidence,
      color: det.confidence > 0.9 ? '#FF3B30' : '#FF9500', // 신뢰도에 따라 색상 변경
    }));
    
    setDetections(newDetections);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} />
      <BoundingBoxOverlay detections={detections} />
    </View>
  );
}
```

### 커스터마이징

```tsx
<BoundingBox
  x={100}
  y={200}
  width={150}
  height={150}
  label="플라스틱"
  confidence={0.95}
  color="#00FF00" // 초록색
  borderWidth={5} // 두꺼운 테두리
  showLabel={true} // 라벨 표시
/>
```

### 좌표 변환 (정규화된 좌표 → 픽셀 좌표)

백엔드에서 0-1 사이의 정규화된 좌표를 받는 경우:

```tsx
const convertNormalizedToPixel = (
  normalizedBox: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
) => {
  return {
    x: normalizedBox.x * imageWidth,
    y: normalizedBox.y * imageHeight,
    width: normalizedBox.width * imageWidth,
    height: normalizedBox.height * imageHeight,
  };
};

// 사용 예
const pixelBox = convertNormalizedToPixel(
  { x: 0.5, y: 0.3, width: 0.2, height: 0.2 },
  screenWidth,
  screenHeight
);
```

## Props

### BoundingBox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| x | number | required | 좌측 상단 x 좌표 |
| y | number | required | 좌측 상단 y 좌표 |
| width | number | required | 박스 너비 |
| height | number | required | 박스 높이 |
| label | string | "쓰레기" | 라벨 텍스트 |
| confidence | number | undefined | 신뢰도 (0-1) |
| color | string | "#FF3B30" | 박스 색상 |
| borderWidth | number | 3 | 테두리 두께 |
| showLabel | boolean | true | 라벨 표시 여부 |

### BoundingBoxOverlay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| detections | Detection[] | required | 감지 결과 배열 |
| containerWidth | number | undefined | 컨테이너 너비 |
| containerHeight | number | undefined | 컨테이너 높이 |

## 백엔드 응답 예시

```json
{
  "detections": [
    {
      "class_name": "쓰레기",
      "confidence": 0.95,
      "bbox": [100, 200, 150, 150]
    },
    {
      "class_name": "쓰레기",
      "confidence": 0.87,
      "bbox": [300, 400, 120, 120]
    }
  ]
}
```

## 성능 최적화

1. **감지 결과 제한**: 신뢰도가 낮은 결과 필터링
```tsx
const filteredDetections = detections.filter(d => d.confidence > 0.7);
```

2. **업데이트 빈도 제한**: 너무 자주 업데이트하지 않기
```tsx
const [detections, setDetections] = useState<Detection[]>([]);
const lastUpdateRef = useRef(0);

const updateDetections = (newDetections: Detection[]) => {
  const now = Date.now();
  if (now - lastUpdateRef.current > 100) { // 100ms 제한
    setDetections(newDetections);
    lastUpdateRef.current = now;
  }
};
```

3. **메모이제이션**: 불필요한 리렌더링 방지
```tsx
const memoizedOverlay = useMemo(
  () => <BoundingBoxOverlay detections={detections} />,
  [detections]
);
```
