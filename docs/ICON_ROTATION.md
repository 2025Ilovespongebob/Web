# 아이콘 회전 가이드

## 개요
길안내 모드에서 사용자 위치 아이콘이 실제 이동 방향을 가리키도록 회전합니다.

---

## 작동 원리

### 기본 개념
```
원래 아이콘: ↑ (북쪽을 가리킴)
GPS Heading: 0도 = 북쪽

이동 방향에 따라 아이콘 회전:
- 북쪽 (0도): ↑
- 동쪽 (90도): →
- 남쪽 (180도): ↓
- 서쪽 (270도): ←
```

---

## 시각적 예제

### 북쪽으로 이동 (0도)
```
GPS Heading: 0도
아이콘 회전: 0도

지도:
┌─────────┐
│    ↑    │  아이콘이 북쪽(위)을 가리킴
│    •    │  지도는 회전 안 함
└─────────┘
```

### 동쪽으로 이동 (90도)
```
GPS Heading: 90도
아이콘 회전: 90도

지도:
┌─────────┐
│    →    │  아이콘이 동쪽(오른쪽)을 가리킴
│    •    │  지도는 -90도 회전 (동쪽이 위로)
└─────────┘
```

### 남쪽으로 이동 (180도)
```
GPS Heading: 180도
아이콘 회전: 180도

지도:
┌─────────┐
│    ↓    │  아이콘이 남쪽(아래)을 가리킴
│    •    │  지도는 -180도 회전 (남쪽이 위로)
└─────────┘
```

### 서쪽으로 이동 (270도)
```
GPS Heading: 270도
아이콘 회전: 270도

지도:
┌─────────┐
│    ←    │  아이콘이 서쪽(왼쪽)을 가리킴
│    •    │  지도는 -270도 회전 (서쪽이 위로)
└─────────┘
```

---

## 코드 구현

### SVG 회전
```xml
<svg width="40" height="46" viewBox="0 0 40 46">
  <g transform="rotate(${heading} 20 23)">
    <!-- heading: GPS 방향 값 (0-360) -->
    <!-- 20, 23: 회전 중심점 (아이콘 중앙) -->
    
    <g filter="url(#filter0_d)">
      <path d="M20 12L28 34L20 30.3333L12 34L20 12Z" fill="white"/>
      <path d="M20 16L26 32L20 29.3333L14 32L20 16Z" fill="#155DFC"/>
    </g>
  </g>
</svg>
```

### JavaScript 업데이트
```javascript
function updateNavigation(location, heading) {
  // 마커 이미지 생성 (heading 값 포함)
  const userMarkerSrc = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="46" viewBox="0 0 40 46">
      <g transform="rotate(${heading} 20 23)">
        <!-- 화살표 SVG -->
      </g>
    </svg>
  `);
  
  // 마커 이미지 업데이트
  const userMarkerImage = new kakao.maps.MarkerImage(
    userMarkerSrc,
    new kakao.maps.Size(40, 46),
    { offset: new kakao.maps.Point(20, 46) }
  );
  
  currentUserMarker.setImage(userMarkerImage);
}
```

---

## 회전 중심점 계산

### 아이콘 크기
```
너비: 40px
높이: 46px
```

### 중심점
```
X 중심: 40 / 2 = 20
Y 중심: 46 / 2 = 23

회전 중심: (20, 23)
```

### 시각적 표현
```
(0,0) ┌──────────┐ (40,0)
      │          │
      │    ●     │ ← (20, 23) 중심점
      │   ↑     │
      │          │
(0,46)└──────────┘ (40,46)
```

---

## 지도 회전과의 관계

### 지도 회전
```javascript
// 지도는 반대 방향으로 회전
const mapRotation = -heading;
map.style.transform = `rotateZ(${mapRotation}deg)`;
```

### 아이콘 회전
```javascript
// 아이콘은 실제 방향으로 회전
const iconRotation = heading;
<g transform="rotate(${iconRotation} 20 23)">
```

### 결합 효과
```
예: 동쪽으로 이동 (90도)

지도 회전: -90도
  → 동쪽이 위를 향함
  
아이콘 회전: +90도
  → 아이콘이 동쪽(오른쪽)을 가리킨 상태
  
결과:
  → 지도에서 아이콘은 위를 가리키는 것처럼 보임
  → 하지만 실제로는 동쪽을 가리킴
```

---

## 각도 변환표

| 방향 | GPS Heading | 지도 회전 | 아이콘 회전 | 결과 |
|------|-------------|-----------|-------------|------|
| 북 ↑ | 0° | 0° | 0° | 아이콘 ↑ |
| 북동 ↗ | 45° | -45° | 45° | 아이콘 ↗ |
| 동 → | 90° | -90° | 90° | 아이콘 → |
| 남동 ↘ | 135° | -135° | 135° | 아이콘 ↘ |
| 남 ↓ | 180° | -180° | 180° | 아이콘 ↓ |
| 남서 ↙ | 225° | -225° | 225° | 아이콘 ↙ |
| 서 ← | 270° | -270° | 270° | 아이콘 ← |
| 북서 ↖ | 315° | -315° | 315° | 아이콘 ↖ |

---

## 실시간 업데이트

### 업데이트 주기
```
GPS 업데이트: 1초마다
Heading 변화: 5도 이상 변경 시
```

### 성능 최적화
```javascript
let lastHeading = 0;

function updateNavigation(location, heading) {
  // 5도 이상 변경된 경우만 업데이트
  if (Math.abs(heading - lastHeading) > 5) {
    updateMarkerIcon(heading);
    lastHeading = heading;
  }
}
```

---

## 커스터마이징

### 회전 속도 조정
```javascript
// 즉시 회전
<g transform="rotate(${heading} 20 23)">

// 부드러운 회전 (CSS transition)
<g style="transition: transform 0.3s ease-out"
   transform="rotate(${heading} 20 23)">
```

### 회전 민감도
```javascript
// 매우 민감 (1도 변화도 감지)
if (Math.abs(heading - lastHeading) > 1)

// 보통 (5도 변화 감지)
if (Math.abs(heading - lastHeading) > 5)

// 둔감 (10도 변화 감지)
if (Math.abs(heading - lastHeading) > 10)
```

---

## 문제 해결

### 아이콘이 회전 안 해요
1. GPS heading 값 확인
2. SVG transform 문법 확인
3. 마커 이미지 업데이트 확인

### 아이콘이 반대로 회전해요
```javascript
// 잘못된 방향
<g transform="rotate(${-heading} 20 23)">

// 올바른 방향
<g transform="rotate(${heading} 20 23)">
```

### 아이콘이 너무 빨리 회전해요
```javascript
// 민감도 낮추기
if (Math.abs(heading - lastHeading) > 10)
```

### 아이콘이 흔들려요
```javascript
// heading 값 평균화
const smoothHeading = (lastHeading * 0.7) + (heading * 0.3);
```

---

## 참고
- SVG Transform: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
- GPS Heading: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/heading
