# 마커 커스터마이징 가이드

## 개요
지도에 표시되는 마커 아이콘을 커스터마이징하는 방법입니다.

---

## 현재 마커 설정

### 내 위치 마커
- **아이콘**: `/assets/icons/UserPosition.svg`
- **크기**: 40x46 픽셀
- **디자인**: 파란색 화살표 (방향 표시)

### 목적지 마커
- **아이콘**: 빨간색 핀 + 번호
- **크기**: 40x50 픽셀
- **번호**: 1, 2, 3, ... (순서대로)

---

## 마커 구조

### 코드 위치
`sea-vision-rn/components/simple-route-map.tsx`

### 마커 생성 로직
```javascript
locations.forEach((location, index) => {
  if (index === 0) {
    // 첫 번째 = 내 위치 (UserPosition.svg)
  } else {
    // 나머지 = 목적지 (번호 표시)
  }
});
```

---

## 내 위치 마커 변경

### 1. SVG 파일 준비
`/assets/icons/` 폴더에 SVG 파일 저장

### 2. SVG 내용 복사
```xml
<svg width="40" height="46" viewBox="0 0 40 46" fill="none">
  <!-- SVG 내용 -->
</svg>
```

### 3. 코드에 적용
`simple-route-map.tsx`에서:

```javascript
if (index === 0) {
  imageSrc = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="46" viewBox="0 0 40 46" fill="none">
      <!-- 여기에 SVG 내용 붙여넣기 -->
    </svg>
  `);
}
```

### 4. 크기 조정
```javascript
const imageSize = index === 0 
  ? new kakao.maps.Size(40, 46)  // 너비, 높이
  : new kakao.maps.Size(40, 50);
```

### 5. 앵커 포인트 조정
```javascript
const imageOption = index === 0
  ? { offset: new kakao.maps.Point(20, 46) }  // X, Y (하단 중앙)
  : { offset: new kakao.maps.Point(20, 50) };
```

---

## 목적지 마커 변경

### 색상 변경
```javascript
// 빨강 → 파랑
fill="#FF6B6B"  →  fill="#4169E1"

// 빨강 → 초록
fill="#FF6B6B"  →  fill="#00FF00"
```

### 번호 스타일 변경
```javascript
<text 
  x="20" 
  y="25" 
  font-size="16"      // 크기
  font-weight="bold"  // 굵기
  fill="white"        // 색상
  text-anchor="middle"
>
  ${index}
</text>
```

### 완전히 다른 아이콘 사용
```javascript
else {
  imageSrc = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="15" fill="#FF6B6B"/>
      <text x="15" y="20" font-size="14" fill="white" text-anchor="middle">
        ${index}
      </text>
    </svg>
  `);
}
```

---

## 다양한 마커 예제

### 예제 1: 원형 마커
```javascript
imageSrc = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="#FF6B6B" stroke="white" stroke-width="3"/>
    <text x="20" y="26" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
      ${index}
    </text>
  </svg>
`);
```

### 예제 2: 사각형 마커
```javascript
imageSrc = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="40" height="40" viewBox="0 0 40 40">
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#FF6B6B" stroke="white" stroke-width="3"/>
    <text x="20" y="26" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
      ${index}
    </text>
  </svg>
`);
```

### 예제 3: 별 모양 마커
```javascript
imageSrc = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="40" height="40" viewBox="0 0 40 40">
    <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" 
          fill="#FFD700" stroke="white" stroke-width="2"/>
    <text x="20" y="24" font-size="12" font-weight="bold" fill="white" text-anchor="middle">
      ${index}
    </text>
  </svg>
`);
```

### 예제 4: 이모지 마커
```javascript
imageSrc = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="white" stroke="#333" stroke-width="2"/>
    <text x="20" y="28" font-size="24" text-anchor="middle">📍</text>
  </svg>
`);
```

---

## 카테고리별 마커

### 음식점, 관광지, 숙소 구분
```javascript
const getMarkerIcon = (index, category) => {
  if (index === 0) {
    // 내 위치
    return userPositionSVG;
  }
  
  // 카테고리별 색상
  const colors = {
    restaurant: '#FF6B6B',  // 빨강
    tourist: '#4ECDC4',     // 청록
    hotel: '#45B7D1'        // 파랑
  };
  
  const color = colors[category] || '#FF6B6B';
  
  return `
    <svg width="40" height="50" viewBox="0 0 40 50">
      <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <text x="20" y="25" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
        ${index}
      </text>
    </svg>
  `;
};
```

---

## 이미지 파일 사용

### PNG/JPG 이미지 사용
```javascript
// 이미지 URL 사용
const imageSrc = 'https://example.com/marker.png';

// 또는 base64 인코딩된 이미지
const imageSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

const markerImage = new kakao.maps.MarkerImage(
  imageSrc,
  new kakao.maps.Size(40, 50),
  { offset: new kakao.maps.Point(20, 50) }
);
```

---

## 앵커 포인트 이해

### 앵커 포인트란?
마커 이미지에서 지도 좌표와 연결되는 지점

```
(0, 0) ┌─────────┐
       │         │
       │    ●    │ ← 중앙
       │         │
       └────●────┘
          (20, 50) ← 하단 중앙 (일반적)
```

### 일반적인 앵커 포인트
```javascript
// 하단 중앙 (핀 모양)
{ offset: new kakao.maps.Point(20, 50) }

// 중앙 (원형)
{ offset: new kakao.maps.Point(20, 20) }

// 좌상단
{ offset: new kakao.maps.Point(0, 0) }
```

---

## 애니메이션 효과

### CSS 애니메이션 추가
```javascript
imageSrc = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="40" height="50" viewBox="0 0 40 50">
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .marker { animation: pulse 2s infinite; }
    </style>
    <g class="marker">
      <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" 
            fill="#FF6B6B"/>
    </g>
  </svg>
`);
```

---

## 실전 팁

### 1. SVG 최적화
- 불필요한 요소 제거
- 경로 단순화
- 파일 크기 최소화

### 2. 크기 일관성
- 모든 마커를 비슷한 크기로 유지
- 너무 크면 지도가 복잡해짐
- 권장: 30-50 픽셀

### 3. 색상 대비
- 배경과 구분되는 색상 사용
- 흰색 테두리로 가독성 향상

### 4. 성능
- SVG가 PNG보다 가벼움
- 복잡한 SVG는 성능 저하 가능

---

## 문제 해결

### 마커가 안 보여요
1. SVG 문법 확인
2. viewBox 크기 확인
3. fill 색상 확인

### 마커 위치가 이상해요
1. 앵커 포인트 조정
2. offset 값 변경

### 마커가 깨져요
1. SVG 인코딩 확인
2. 특수문자 이스케이프

---

## 참고
- SVG 편집: https://www.figma.com/
- SVG 최적화: https://jakearchibald.github.io/svgomg/
- 카카오맵 API: https://apis.map.kakao.com/web/
