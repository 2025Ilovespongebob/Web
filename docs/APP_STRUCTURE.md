# 앱 구조 가이드

## 개요
Sea Vision RN 앱의 전체 구조와 화면 구성입니다.

---

## 화면 구조

### 스플래시 화면
- **표시 시간**: 2초
- **디자인**: 흰색 배경 + 중앙 로고
- **애니메이션**: 페이드 인/아웃 (0.5초)

### 탭 구조
```
┌─────────────────────────┐
│   Home   Map   Camera   │  ← 하단 탭바
└─────────────────────────┘
```

#### 1. Home 탭
- **아이콘**: 🏠 house.fill
- **내용**: 빈 화면 (향후 확장 가능)
- **배경**: 흰색

#### 2. Map 탭
- **아이콘**: 🗺️ map.fill
- **기능**: 
  - 위도/경도 입력
  - 경로 표시
  - 길안내 모드
  - 3D 지도 회전

#### 3. Camera 탭
- **아이콘**: 📷 camera.fill
- **기능**:
  - 실시간 영상 촬영
  - 백엔드로 스트리밍
  - 프레임 전송

---

## 파일 구조

```
sea-vision-rn/
├── app/
│   ├── _layout.tsx              # 메인 레이아웃 (스플래시 포함)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # 탭 레이아웃
│   │   ├── index.tsx            # Home 탭 (빈 화면)
│   │   ├── map.tsx              # Map 탭
│   │   └── camera.tsx           # Camera 탭
│   └── modal.tsx
├── components/
│   ├── splash-screen.tsx        # 스플래시 화면
│   ├── route-input-screen.tsx   # 경로 입력 화면
│   ├── simple-route-map.tsx     # 지도 + 경로
│   └── video-stream-screen.tsx  # 영상 스트리밍
├── assets/
│   └── icons/
│       └── logo.svg             # 앱 로고
└── docs/
    └── APP_STRUCTURE.md         # 이 파일
```

---

## 스플래시 화면 상세

### 디자인
```
┌─────────────────────┐
│                     │
│                     │
│      JubGo Logo     │  ← 중앙 정렬
│                     │
│                     │
└─────────────────────┘
```

### 타이밍
```
0.0초: 앱 시작
0.0초: 페이드 인 시작
0.5초: 로고 완전히 표시
2.0초: 페이드 아웃 시작
2.5초: 메인 화면 표시
```

### 애니메이션
```typescript
// 페이드 인
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 500,
  useNativeDriver: true,
}).start();

// 2초 대기 후 페이드 아웃
setTimeout(() => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 500,
    useNativeDriver: true,
  }).start(() => {
    onFinish(); // 메인 화면으로 이동
  });
}, 2000);
```

---

## 탭 네비게이션

### 탭 순서
1. **Home** (index.tsx)
2. **Map** (map.tsx)
3. **Camera** (camera.tsx)

### 탭 아이콘
- SF Symbols 사용
- 활성/비활성 색상 자동 변경
- 햅틱 피드백 지원

---

## 화면 전환 흐름

```
[앱 시작]
    ↓
[스플래시 화면] (2초)
    ↓
[Home 탭] (기본)
    ↓
사용자가 탭 선택
    ↓
[Map 탭] 또는 [Camera 탭]
```

---

## Home 탭 확장 아이디어

현재는 빈 화면이지만, 향후 추가 가능한 기능:

### 1. 대시보드
```typescript
<View>
  <Text>최근 경로</Text>
  <Text>저장된 장소</Text>
  <Text>통계</Text>
</View>
```

### 2. 빠른 액세스
```typescript
<View>
  <Button>새 경로 만들기</Button>
  <Button>저장된 경로 보기</Button>
  <Button>설정</Button>
</View>
```

### 3. 최근 활동
```typescript
<ScrollView>
  {recentRoutes.map(route => (
    <RouteCard key={route.id} route={route} />
  ))}
</ScrollView>
```

---

## 커스터마이징

### 스플래시 시간 변경
**파일**: `sea-vision-rn/components/splash-screen.tsx`

```typescript
// 현재: 2초
setTimeout(() => { ... }, 2000);

// 1초로 변경
setTimeout(() => { ... }, 1000);

// 3초로 변경
setTimeout(() => { ... }, 3000);
```

### 로고 크기 변경
```typescript
// 현재: 2배 크기
<SvgXml xml={logoSvg} width={286} height={72} />

// 더 크게
<SvgXml xml={logoSvg} width={429} height={108} />

// 더 작게
<SvgXml xml={logoSvg} width={143} height={36} />
```

### 배경색 변경
```typescript
container: {
  backgroundColor: '#ffffff', // 흰색
  // backgroundColor: '#000000', // 검정
  // backgroundColor: '#155DFC', // 파랑
}
```

### 탭 순서 변경
**파일**: `sea-vision-rn/app/(tabs)/_layout.tsx`

```typescript
// 현재 순서: Home, Map, Camera
<Tabs.Screen name="index" />
<Tabs.Screen name="map" />
<Tabs.Screen name="camera" />

// 변경 예시: Map, Camera, Home
<Tabs.Screen name="map" />
<Tabs.Screen name="camera" />
<Tabs.Screen name="index" />
```

---

## 제거된 화면

### Explore 탭
- **이유**: 불필요
- **제거 파일**: `app/(tabs)/explore.tsx`
- **제거 날짜**: 2024

---

## 성능 최적화

### 스플래시 화면
- Native Driver 사용 (GPU 가속)
- 최소한의 컴포넌트
- 빠른 로딩

### 탭 네비게이션
- Lazy Loading (필요할 때만 로드)
- 햅틱 피드백 최적화
- 메모리 효율적

---

## 접근성

### 스플래시 화면
- 애니메이션 시간 적절 (2초)
- 고대비 로고 (검정 + 파랑)

### 탭 네비게이션
- 명확한 아이콘
- 텍스트 레이블
- 햅틱 피드백

---

## 문제 해결

### 스플래시가 안 보여요
1. react-native-svg 설치 확인
2. 로고 SVG 경로 확인
3. 앱 재시작

### 탭이 안 보여요
1. 탭 레이아웃 확인
2. 파일 이름 확인 (index.tsx, map.tsx, camera.tsx)
3. 캐시 삭제 후 재시작

### Home 탭이 비어있어요
- 정상입니다! 의도적으로 빈 화면입니다.
- 향후 기능 추가 예정

---

## 참고
- Expo Router: https://docs.expo.dev/router/introduction/
- React Navigation: https://reactnavigation.org/
- React Native SVG: https://github.com/software-mansion/react-native-svg
