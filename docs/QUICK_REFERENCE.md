# 빠른 참조 가이드

## 현재 설정 요약

### 🎨 경로 색상
```
구간 1 (내 위치 → 목적지 1): 🔴 빨강 (#FF0000)
구간 2 (목적지 1 → 목적지 2): 🔵 파랑 (#0066FF)
구간 3 (목적지 2 → 목적지 3): 🟢 초록 (#00CC00)
구간 4 (목적지 3 → 목적지 4): 🟡 노랑 (#FFD700)
구간 5 (목적지 4 → 목적지 5): 🟣 보라 (#FF00FF)
```

### 📍 마커 아이콘
```
내 위치: UserPosition.svg (파란 화살표)
목적지 1: 빨간 핀 + 숫자 1
목적지 2: 빨간 핀 + 숫자 2
목적지 3: 빨간 핀 + 숫자 3
```

### 🔑 API 키
```
카카오 REST API: 99e3fd064582ce7387fe6b1bc3eb1e9a
카카오 JS API: eee93c472709b2e00c96b5bc6e935d4c
카카오 네이티브: 47d7cc0c8225137c73271634b947fc42
```

---

## 빠른 수정

### 경로 색상 변경
**파일**: `sea-vision-rn/components/simple-route-map.tsx`

**위치**: 약 39번째 줄
```typescript
const colors = ['#FF0000', '#0066FF', '#00CC00', '#FFD700', '#FF00FF'];
```

### 내 위치 아이콘 변경
**파일**: `sea-vision-rn/components/simple-route-map.tsx`

**위치**: 약 170번째 줄 (WebView HTML 내부)
```javascript
if (index === 0) {
  imageSrc = 'data:image/svg+xml;base64,' + btoa(`
    <!-- 여기에 새 SVG 코드 -->
  `);
}
```

### 목적지 마커 색상 변경
**파일**: `sea-vision-rn/components/simple-route-map.tsx`

**위치**: 약 190번째 줄
```javascript
fill="#FF6B6B"  // 이 색상 변경
```

### 백엔드 URL 설정
**파일**: `sea-vision-rn/components/video-stream-screen.tsx`

**위치**: 약 15번째 줄
```typescript
const DEFAULT_BACKEND_URL = 'http://your-backend-url.com/api/stream';
```

---

## 파일 구조

```
sea-vision-rn/
├── app/(tabs)/
│   ├── map.tsx              # 지도 탭
│   └── camera.tsx           # 카메라 탭
├── components/
│   ├── simple-route-map.tsx      # 지도 + 경로 표시
│   ├── route-input-screen.tsx    # 좌표 입력 화면
│   └── video-stream-screen.tsx   # 영상 스트리밍
├── hooks/
│   ├── use-kakao-route.ts        # 경로 계산 API
│   └── use-travel-markers.ts     # 마커 관리
├── types/
│   └── travel.ts                 # 타입 정의
├── assets/icons/
│   └── UserPosition.svg          # 내 위치 아이콘
└── docs/
    ├── MAP_API.md                # 지도 API 문서
    ├── CAMERA_API.md             # 카메라 API 문서
    ├── ROUTE_COLOR.md            # 경로 색상 가이드
    ├── MARKER_CUSTOMIZATION.md   # 마커 커스터마이징
    └── QUICK_REFERENCE.md        # 이 파일
```

---

## 주요 기능

### 지도 경로 표시
1. Map 탭 선택
2. 위도/경도 3개 입력
3. "경로 보기" 버튼 클릭
4. 지도에 마커 + 경로 표시

### 길안내 모드 🆕
1. "🧭 길안내 시작" 버튼 클릭
2. 실시간 위치 추적
3. **3D 기울임 (45도)**
4. **방향에 따라 지도 자동 회전**
5. 지나간 경로 자동 제거

### 영상 스트리밍
1. Camera 탭 선택
2. ⚙️ 버튼으로 백엔드 URL 입력
3. ▶ 시작 버튼 클릭
4. 초당 5프레임 전송

---

## 자주 사용하는 색상 코드

### 기본 색상
```
빨강: #FF0000
주황: #FF8800
노랑: #FFFF00
초록: #00FF00
파랑: #0000FF
남색: #4B0082
보라: #8B00FF
```

### 선명한 색상
```
빨강: #FF0000
파랑: #0066FF
초록: #00CC00
노랑: #FFD700
보라: #FF00FF
```

### 파스텔 톤
```
연분홍: #FFB6C1
연주황: #FFDAB9
연노랑: #FFFACD
연초록: #90EE90
연파랑: #ADD8E6
연보라: #DDA0DD
```

---

## 실행 명령어

### 개발 서버 시작
```bash
cd sea-vision-rn
npx expo start -c
```

### iOS 시뮬레이터
```bash
npx expo start --ios
```

### Android 에뮬레이터
```bash
npx expo start --android
```

### 캐시 삭제 후 시작
```bash
npx expo start -c
```

---

## 문제 해결

### 지도가 안 보여요
1. 인터넷 연결 확인
2. API 키 확인
3. 앱 재시작 (`npx expo start -c`)

### 경로가 안 그려져요
1. 최소 2개 위치 입력 확인
2. 좌표 범위 확인 (위도: -90~90, 경도: -180~180)
3. 네트워크 연결 확인

### 카메라가 안 켜져요
1. 카메라 권한 확인
2. 설정 > 앱 > 권한 확인
3. 앱 재설치

### 영상이 전송 안 돼요
1. 백엔드 URL 확인
2. 백엔드 서버 실행 확인
3. 같은 네트워크인지 확인

---

## 성능 최적화

### 경로 계산 속도
- 목적지 개수: 최대 5개 권장
- 거리가 멀수록 계산 시간 증가

### 영상 스트리밍
- 화질: 0.3~0.5 권장
- FPS: 5 FPS 권장
- Wi-Fi 사용 권장

---

## 연락처

문제가 있거나 질문이 있으면 문서를 참고하세요:
- `/docs/MAP_API.md` - 지도 API 상세
- `/docs/CAMERA_API.md` - 카메라 API 상세
- `/docs/ROUTE_COLOR.md` - 색상 커스터마이징
- `/docs/MARKER_CUSTOMIZATION.md` - 마커 커스터마이징
