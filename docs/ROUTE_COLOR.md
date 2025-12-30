# 경로 색상 커스터마이징 가이드

## 개요
각 구간별로 다른 색상의 경로선을 표시할 수 있습니다.

---

## 기본 색상 설정

### 현재 색상 배열
```typescript
const colors = [
  '#FF0000',  // 빨강 (구간 1: 내 위치 → 목적지 1)
  '#0066FF',  // 파랑 (구간 2: 목적지 1 → 목적지 2)
  '#00CC00',  // 초록 (구간 3: 목적지 2 → 목적지 3)
  '#FFD700',  // 노랑 (구간 4: 목적지 3 → 목적지 4)
  '#FF00FF'   // 보라 (구간 5: 목적지 4 → 목적지 5)
];
```

### 결과
```
내 위치 → 목적지 1: 빨간색 (#FF0000)
목적지 1 → 목적지 2: 파란색 (#0066FF)
목적지 2 → 목적지 3: 초록색 (#00CC00)
목적지 3 → 목적지 4: 노란색 (#FFD700)
```

---

## 색상 변경 방법

### 1. 파일 열기
`sea-vision-rn/components/simple-route-map.tsx`

### 2. 색상 배열 찾기
```typescript
// 구간별 색상 정의
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
```

### 3. 원하는 색상으로 변경
```typescript
// 예시 1: 모두 파란색 계열
const colors = ['#1E90FF', '#4169E1', '#0000CD', '#00008B', '#000080'];

// 예시 2: 무지개 색상
const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'];

// 예시 3: 그라데이션 (빨강 → 보라)
const colors = ['#FF6B6B', '#E74C8C', '#C44CAD', '#A14CCE', '#7E4CEF'];

// 예시 4: 단색 (모두 빨강)
const colors = ['#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B'];
```

---

## 데이터 구조

### RouteInfo 타입
```typescript
interface RouteInfo {
  path: Array<{x: number, y: number}>;  // 경로 좌표
  color: string;                         // 경로 색상
}
```

### 예시 데이터
```typescript
const routes = [
  {
    path: [
      { x: 129.2249, y: 35.8560 },
      { x: 129.2248, y: 35.8559 }
    ],
    color: '#FF6B6B'  // 빨강
  },
  {
    path: [
      { x: 129.2248, y: 35.8345 },
      { x: 129.2247, y: 35.8344 }
    ],
    color: '#4ECDC4'  // 청록
  },
  {
    path: [
      { x: 129.2180, y: 35.8290 },
      { x: 129.2179, y: 35.8289 }
    ],
    color: '#45B7D1'  // 파랑
  }
];
```

---

## 색상 적용 코드

### React Native (simple-route-map.tsx)
```typescript
// 구간별 색상 지정
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
const color = colors[i % colors.length];  // 순환 사용

routes.push({ 
  path: pathCoords, 
  color: color 
});
```

### WebView (카카오맵)
```javascript
routes.forEach(route => {
  const polyline = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 5,
    strokeColor: route.color || '#FF6B6B',  // 색상 적용
    strokeOpacity: 0.7,
    strokeStyle: 'solid'
  });
  
  polyline.setMap(map);
});
```

---

## 색상 코드 참고

### 기본 색상
```
빨강: #FF0000
주황: #FFA500
노랑: #FFFF00
초록: #00FF00
파랑: #0000FF
남색: #4B0082
보라: #8B00FF
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

### 진한 색상
```
진빨강: #8B0000
진주황: #FF8C00
진노랑: #FFD700
진초록: #006400
진파랑: #00008B
진보라: #4B0082
```

### 현대적인 색상
```
코랄: #FF6B6B
청록: #4ECDC4
하늘: #45B7D1
살몬: #FFA07A
민트: #98D8C8
라벤더: #A29BFE
```

---

## 고급 설정

### 조건부 색상
```typescript
// 거리에 따라 색상 변경
const getColorByDistance = (distance: number) => {
  if (distance < 1000) return '#00FF00';      // 1km 미만: 초록
  if (distance < 5000) return '#FFFF00';      // 5km 미만: 노랑
  if (distance < 10000) return '#FFA500';     // 10km 미만: 주황
  return '#FF0000';                           // 10km 이상: 빨강
};

const color = getColorByDistance(routeInfo.distance);
```

### 시간에 따라 색상 변경
```typescript
const getColorByDuration = (duration: number) => {
  if (duration < 300) return '#00FF00';       // 5분 미만: 초록
  if (duration < 600) return '#FFFF00';       // 10분 미만: 노랑
  if (duration < 1200) return '#FFA500';      // 20분 미만: 주황
  return '#FF0000';                           // 20분 이상: 빨강
};
```

### 구간 번호에 따라 색상 변경
```typescript
const getColorByIndex = (index: number) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  return colors[index % colors.length];
};
```

---

## 실전 예제

### 예제 1: 교통 신호등 스타일
```typescript
const colors = [
  '#00FF00',  // 초록 (출발)
  '#FFFF00',  // 노랑 (중간)
  '#FF0000'   // 빨강 (도착)
];
```

### 예제 2: 그라데이션 효과
```typescript
const colors = [
  '#FF0000',  // 빨강
  '#FF4500',  // 주황빨강
  '#FF8C00',  // 진주황
  '#FFA500',  // 주황
  '#FFD700'   // 금색
];
```

### 예제 3: 블루 계열
```typescript
const colors = [
  '#E3F2FD',  // 매우 연한 파랑
  '#90CAF9',  // 연한 파랑
  '#42A5F5',  // 파랑
  '#1E88E5',  // 진한 파랑
  '#1565C0'   // 매우 진한 파랑
];
```

---

## 투명도 조절

### strokeOpacity 변경
```javascript
const polyline = new kakao.maps.Polyline({
  strokeColor: route.color,
  strokeOpacity: 0.7,  // 0.0 ~ 1.0
  // 0.3 = 매우 투명
  // 0.5 = 반투명
  // 0.7 = 약간 투명 (기본값)
  // 1.0 = 불투명
});
```

---

## 선 두께 조절

### strokeWeight 변경
```javascript
const polyline = new kakao.maps.Polyline({
  strokeWeight: 5,  // 픽셀 단위
  // 3 = 얇음
  // 5 = 보통 (기본값)
  // 8 = 두꺼움
  // 10 = 매우 두꺼움
});
```

---

## 선 스타일 변경

### strokeStyle 옵션
```javascript
const polyline = new kakao.maps.Polyline({
  strokeStyle: 'solid',  // 실선 (기본값)
  // 'solid' = 실선 ━━━━━
  // 'shortdash' = 짧은 점선 ╌╌╌╌╌
  // 'shortdot' = 짧은 점 ┄┄┄┄┄
  // 'shortdashdot' = 점선+점 ╌┄╌┄╌
  // 'longdash' = 긴 점선 ╍╍╍╍╍
  // 'longdashdot' = 긴 점선+점 ╍┄╍┄╍
  // 'dot' = 점 ····
});
```

---

## 완전한 커스터마이징 예제

```typescript
// simple-route-map.tsx에서
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
const weights = [5, 6, 7];  // 점점 두꺼워짐
const opacities = [0.7, 0.8, 0.9];  // 점점 진해짐

routes.push({ 
  path: pathCoords, 
  color: colors[i],
  weight: weights[i],
  opacity: opacities[i]
});
```

```javascript
// WebView에서
const polyline = new kakao.maps.Polyline({
  path: linePath,
  strokeWeight: route.weight || 5,
  strokeColor: route.color || '#FF6B6B',
  strokeOpacity: route.opacity || 0.7,
  strokeStyle: 'solid'
});
```

---

## 테스트

1. 색상 배열 수정
2. 앱 재시작 (`npx expo start -c`)
3. Map 탭에서 경로 확인
4. 각 구간의 색상이 다르게 표시됨

---

## 참고
- HTML 색상 코드: https://htmlcolorcodes.com/
- 색상 팔레트 생성: https://coolors.co/
- 카카오맵 API: https://apis.map.kakao.com/web/
