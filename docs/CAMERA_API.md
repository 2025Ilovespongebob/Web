# 실시간 영상 스트리밍 API 문서

## 개요
카메라로 촬영한 영상을 실시간으로 백엔드 서버에 전송하는 기능입니다.

---

## 1. 데이터 캡처

### 카메라 설정
```typescript
<CameraView
  ref={cameraRef}
  facing="back"  // 'back' | 'front'
/>
```

### 프레임 캡처
```typescript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.5,        // 화질: 0.1 ~ 1.0
  base64: true,        // base64 인코딩 포함
  skipProcessing: true // 빠른 처리
});

// 결과
{
  uri: "file:///path/to/photo.jpg",
  width: 1920,
  height: 1080,
  base64: "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## 2. 전송 데이터 형식

### FormData 구조
```typescript
const formData = new FormData();

formData.append('frame', {
  uri: photo.uri,              // 파일 경로
  type: 'image/jpeg',          // MIME 타입
  name: 'frame_1234567890.jpg' // 파일명
});

formData.append('timestamp', '1234567890');  // 타임스탬프 (밀리초)
formData.append('frameNumber', '123');       // 프레임 번호
```

---

## 3. HTTP 요청

### 엔드포인트
```
POST {backendUrl}
예: http://192.168.1.100:3000/api/stream
```

### 요청 헤더
```typescript
{
  'Content-Type': 'multipart/form-data'
}
```

### 요청 바디
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="frame"; filename="frame_1234567890.jpg"
Content-Type: image/jpeg

[JPEG 바이너리 데이터]
------WebKitFormBoundary...
Content-Disposition: form-data; name="timestamp"

1234567890
------WebKitFormBoundary...
Content-Disposition: form-data; name="frameNumber"

123
------WebKitFormBoundary...--
```

---

## 4. 백엔드 응답

### 성공 응답
```json
{
  "success": true,
  "frameNumber": 123,
  "timestamp": 1234567890,
  "message": "프레임 수신 완료"
}
```

### 실패 응답
```json
{
  "success": false,
  "error": "오류 메시지"
}
```

---

## 5. 스트리밍 흐름

```
[카메라 촬영]
  ↓
takePictureAsync({ quality: 0.5 })
  ↓
photo = {
  uri: "file:///...",
  width: 1920,
  height: 1080
}
  ↓
[FormData 생성]
  ↓
formData = {
  frame: File,
  timestamp: "1234567890",
  frameNumber: "123"
}
  ↓
[HTTP POST 요청]
  ↓
fetch(backendUrl, {
  method: 'POST',
  body: formData
})
  ↓
[백엔드 응답]
  ↓
{ success: true, frameNumber: 123 }
  ↓
[프레임 카운터 증가]
  ↓
frameCount++
  ↓
[200ms 대기]
  ↓
[다음 프레임 캡처]
```

---

## 6. 타이밍 설정

### 프레임 레이트
```typescript
// 5 FPS (초당 5프레임)
setInterval(() => {
  captureAndSendFrame();
}, 200); // 200ms = 1000ms / 5

// 10 FPS
setInterval(() => {
  captureAndSendFrame();
}, 100); // 100ms

// 2 FPS
setInterval(() => {
  captureAndSendFrame();
}, 500); // 500ms
```

---

## 7. 데이터 타입

### TypeScript 인터페이스
```typescript
// 사진 데이터
interface Photo {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

// FormData 파일
interface FileData {
  uri: string;
  type: string;
  name: string;
}

// 백엔드 응답
interface StreamResponse {
  success: boolean;
  frameNumber?: number;
  timestamp?: number;
  message?: string;
  error?: string;
}
```

---

## 8. 예제 시나리오

### 시작
```
사용자: "▶ 시작" 버튼 클릭
앱: 스트리밍 시작
```

### 프레임 1
```
시간: 0ms
동작: 사진 촬영
데이터: frame_0.jpg (50KB)
전송: POST /api/stream
응답: { success: true, frameNumber: 0 }
```

### 프레임 2
```
시간: 200ms
동작: 사진 촬영
데이터: frame_1.jpg (48KB)
전송: POST /api/stream
응답: { success: true, frameNumber: 1 }
```

### 프레임 3
```
시간: 400ms
동작: 사진 촬영
데이터: frame_2.jpg (52KB)
전송: POST /api/stream
응답: { success: true, frameNumber: 2 }
```

### 중지
```
사용자: "⏹ 중지" 버튼 클릭
앱: 스트리밍 중지
통계: 총 150 프레임 전송
```

---

## 9. 성능 데이터

### 파일 크기 (화질별)
```
quality: 0.1 → 약 20-40 KB/프레임
quality: 0.3 → 약 40-80 KB/프레임
quality: 0.5 → 약 80-150 KB/프레임
quality: 0.7 → 약 150-250 KB/프레임
quality: 1.0 → 약 250-500 KB/프레임
```

### 데이터 사용량 (5 FPS 기준)
```
quality: 0.3 → 약 0.3 MB/초 → 18 MB/분
quality: 0.5 → 약 0.6 MB/초 → 36 MB/분
quality: 0.7 → 약 1.0 MB/초 → 60 MB/분
```

---

## 참고
- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData
