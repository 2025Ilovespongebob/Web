# 지도 경로 표시 API 문서

## 개요
사용자가 입력한 위도/경도 좌표를 기반으로 카카오맵에 경로를 표시하는 기능입니다.

---

## 1. 데이터 입력 형식

### 사용자 입력 데이터
```typescript
interface LocationInput {
  lat: string;  // 위도 (문자열)
  lng: string;  // 경도 (문자열)
}

// 예시
const location1 = { lat: "35.8560", lng: "129.2249" };
const location2 = { lat: "35.8345", lng: "129.2248" };
const location3 = { lat: "35.8290", lng: "129.2180" };
```

### 내 위치 데이터
```typescript
interface MyLocation {
  lat: number;  // 위도 (숫자)
  lng: number;  // 경도 (숫자)
}

// Expo Location API로 자동 획득
const myLocation = {
  lat: 35.8560,
  lng: 129.2249
};
```

---

## 2. 데이터 변환 과정

### Step 1: 입력 검증 및 변환
```typescript
// 문자열 → 숫자 변환
const lat = parseFloat(location1.lat);  // 35.8560
const lng = parseFloat(location1.lng);  // 129.2249

// 유효성 검사
if (isNaN(lat) || isNaN(lng)) {
  throw new Error("올바르지 않은 좌표");
}

// 범위 검사
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  throw new Error("좌표 범위 초과");
}
```

### Step 2: Location 배열 생성
```typescript
interface Location {
  lat: number;
  lng: number;
  name: string;
}

// 최종 배열 (내 위치 + 목적지들)
const locations: Location[] = [
  { lat: 35.8560, lng: 129.2249, name: "내 위치" },
  { lat: 35.8345, lng: 129.2248, name: "목적지 1" },
  { lat: 35.8290, lng: 129.2180, name: "목적지 2" },
  { lat: 35.8400, lng: 129.2100, name: "목적지 3" }
];
```

---

## 3. 카카오 Mobility API 호출

### API 엔드포인트
```
POST https://apis-navi.kakaomobility.com/v1/waypoints/directions
```

### 요청 헤더
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "KakaoAK 99e3fd064582ce7387fe6b1bc3eb1e9a"
}
```

### 요청 바디 (각 구간별)
```typescript
// 구간 1: 내 위치 → 목적지 1
{
  "origin": {
    "x": "129.2249",  // 경도 (문자열)
    "y": "35.8560"    // 위도 (문자열)
  },
  "destination": {
    "x": "129.2248",
    "y": "35.8345"
  },
  "waypoints": [],
  "priority": "RECOMMEND",
  "car_fuel": "GASOLINE",
  "car_hipass": false,
  "alternatives": false,
  "road_details": true
}
```

### 응답 데이터
```typescript
{
  "routes": [
    {
      "summary": {
        "distance": 2500,      // 거리 (미터)
        "duration": 300,       // 시간 (초)
        "fare": {
          "taxi": 5800         // 택시 요금 (원)
        }
      },
      "sections": [
        {
          "roads": [
            {
              "vertexes": [
                129.2249, 35.8560,  // [경도, 위도, 경도, 위도, ...]
                129.2248, 35.8559,
                129.2247, 35.8558,
                // ... 더 많은 좌표
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. 경로 데이터 추출

### vertexes 배열 파싱
```typescript
// vertexes는 [경도, 위도, 경도, 위도, ...] 형식
const vertexes = [129.2249, 35.8560, 129.2248, 35.8559, 129.2247, 35.8558];

// 좌표 쌍으로 변환
const pathCoords: Array<{x: number, y: number}> = [];

for (let i = 0; i < vertexes.length; i += 2) {
  pathCoords.push({
    x: vertexes[i],      // 경도
    y: vertexes[i + 1]   // 위도
  });
}

// 결과
// [
//   { x: 129.2249, y: 35.8560 },
//   { x: 129.2248, y: 35.8559 },
//   { x: 129.2247, y: 35.8558 }
// ]
```

### 전체 경로 데이터 구조
```typescript
interface RouteInfo {
  path: Array<{x: number, y: number}>;  // 경로 좌표들
}

// 모든 구간의 경로
const routes: RouteInfo[] = [
  {
    path: [
      { x: 129.2249, y: 35.8560 },
      { x: 129.2248, y: 35.8559 },
      // ... 내 위치 → 목적지 1
    ]
  },
  {
    path: [
      { x: 129.2248, y: 35.8345 },
      { x: 129.2247, y: 35.8344 },
      // ... 목적지 1 → 목적지 2
    ]
  },
  {
    path: [
      { x: 129.2180, y: 35.8290 },
      { x: 129.2179, y: 35.8289 },
      // ... 목적지 2 → 목적지 3
    ]
  }
];
```

---

## 5. WebView로 데이터 전송

### React Native → WebView 메시지
```typescript
webViewRef.current.postMessage(JSON.stringify({
  type: 'updateRoute',
  locations: [
    { lat: 35.8560, lng: 129.2249, name: "내 위치" },
    { lat: 35.8345, lng: 129.2248, name: "목적지 1" },
    { lat: 35.8290, lng: 129.2180, name: "목적지 2" }
  ],
  routes: [
    {
      path: [
        { x: 129.2249, y: 35.8560 },
        { x: 129.2248, y: 35.8559 }
      ]
    }
  ]
}));
```

---

## 6. 카카오맵에서 렌더링

### 마커 생성
```javascript
// WebView 내부 JavaScript
locations.forEach((location, index) => {
  const position = new kakao.maps.LatLng(location.lat, location.lng);
  
  // 커스텀 마커 이미지 (SVG)
  const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50">
      <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" 
            fill="#FF6B6B" stroke="white" stroke-width="2"/>
      <text x="20" y="25" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
        ${index + 1}
      </text>
    </svg>
  `);
  
  const marker = new kakao.maps.Marker({
    position: position,
    image: new kakao.maps.MarkerImage(imageSrc, new kakao.maps.Size(40, 50))
  });
  
  marker.setMap(map);
});
```

### 경로선 그리기
```javascript
routes.forEach(route => {
  if (route.path && route.path.length > 0) {
    // 좌표 배열 변환
    const linePath = route.path.map(coord => 
      new kakao.maps.LatLng(coord.y, coord.x)  // 주의: y=위도, x=경도
    );
    
    // 폴리라인 생성
    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,           // 선 두께
      strokeColor: '#FF6B6B',    // 빨간색
      strokeOpacity: 0.7,        // 투명도
      strokeStyle: 'solid'       // 실선
    });
    
    polyline.setMap(map);
  }
});
```

---

## 7. 전체 데이터 흐름

```
[사용자 입력]
  ↓
목적지 1: lat="35.8560", lng="129.2249"
목적지 2: lat="35.8345", lng="129.2248"
목적지 3: lat="35.8290", lng="129.2180"
  ↓
[내 위치 추가]
  ↓
locations = [
  { lat: 35.8560, lng: 129.2249, name: "내 위치" },
  { lat: 35.8345, lng: 129.2248, name: "목적지 1" },
  { lat: 35.8290, lng: 129.2180, name: "목적지 2" },
  { lat: 35.8400, lng: 129.2100, name: "목적지 3" }
]
  ↓
[카카오 API 호출 - 구간별]
  ↓
구간 1: 내 위치 → 목적지 1
  요청: { origin: {x: "129.2249", y: "35.8560"}, destination: {x: "129.2248", y: "35.8345"} }
  응답: { distance: 2500, duration: 300, vertexes: [...] }
  
구간 2: 목적지 1 → 목적지 2
  요청: { origin: {x: "129.2248", y: "35.8345"}, destination: {x: "129.2180", y: "35.8290"} }
  응답: { distance: 1800, duration: 240, vertexes: [...] }
  
구간 3: 목적지 2 → 목적지 3
  요청: { origin: {x: "129.2180", y: "35.8290"}, destination: {x: "129.2100", y: "35.8400"} }
  응답: { distance: 2200, duration: 280, vertexes: [...] }
  ↓
[경로 데이터 추출]
  ↓
routes = [
  { path: [{ x: 129.2249, y: 35.8560 }, ...] },  // 구간 1
  { path: [{ x: 129.2248, y: 35.8345 }, ...] },  // 구간 2
  { path: [{ x: 129.2180, y: 35.8290 }, ...] }   // 구간 3
]
  ↓
[통계 계산]
  ↓
totalDistance = 2500 + 1800 + 2200 = 6500m = 6.5km
totalDuration = 300 + 240 + 280 = 820초 = 14분
  ↓
[WebView로 전송]
  ↓
postMessage({
  type: 'updateRoute',
  locations: [...],
  routes: [...]
})
  ↓
[카카오맵 렌더링]
  ↓
- 마커 4개 표시 (1, 2, 3, 4 번호)
- 경로선 3개 그리기 (빨간색)
- 지도 범위 자동 조정
```

---

## 8. 주요 데이터 타입 정리

### TypeScript 인터페이스
```typescript
// 사용자 입력
interface LocationInput {
  lat: string;
  lng: string;
}

// 처리된 위치
interface Location {
  lat: number;
  lng: number;
  name: string;
}

// 경로 좌표
interface PathCoord {
  x: number;  // 경도
  y: number;  // 위도
}

// 경로 정보
interface RouteInfo {
  path: PathCoord[];
}

// 카카오 API 요청
interface KakaoRouteRequest {
  origin: {
    x: string;    // 경도
    y: string;    // 위도
  };
  destination: {
    x: string;
    y: string;
  };
  waypoints: any[];
  priority: string;
  car_fuel: string;
  car_hipass: boolean;
  alternatives: boolean;
  road_details: boolean;
}

// 카카오 API 응답
interface KakaoRouteResponse {
  routes: Array<{
    summary: {
      distance: number;    // 미터
      duration: number;    // 초
      fare?: {
        taxi: number;      // 원
      };
    };
    sections: Array<{
      roads: Array<{
        vertexes: number[];  // [경도, 위도, 경도, 위도, ...]
      }>;
    }>;
  }>;
}

// WebView 메시지
interface WebViewMessage {
  type: 'updateRoute';
  locations: Location[];
  routes: RouteInfo[];
}
```

---

## 9. 예제 시나리오

### 입력
```
내 위치: 자동 감지 (35.8560, 129.2249)
목적지 1: 35.8345, 129.2248
목적지 2: 35.8290, 129.2180
```

### 처리
```
1. 위치 배열 생성: 4개 위치
2. API 호출: 3번 (구간별)
3. 경로 추출: 3개 경로
4. 통계 계산: 총 거리, 총 시간
5. 지도 표시: 마커 4개 + 경로선 3개
```

### 출력
```
지도 화면:
- 마커 1: 내 위치 (35.8560, 129.2249)
- 마커 2: 목적지 1 (35.8345, 129.2248)
- 마커 3: 목적지 2 (35.8290, 129.2180)
- 빨간색 경로선: 1→2→3 순서대로 연결

상단 정보:
- 총 거리: 6.5km
- 총 시간: 14분
```

---

## 10. 좌표계 주의사항

### 카카오맵 좌표계
- **위도 (Latitude)**: Y축, 남북 방향, -90 ~ 90
- **경도 (Longitude)**: X축, 동서 방향, -180 ~ 180

### 데이터 구조에서
```typescript
// 입력/저장 시
{ lat: 35.8560, lng: 129.2249 }

// 카카오 API 요청 시
{ x: "129.2249", y: "35.8560" }  // x=경도, y=위도

// 경로 좌표
{ x: 129.2249, y: 35.8560 }      // x=경도, y=위도

// 카카오맵 객체 생성 시
new kakao.maps.LatLng(35.8560, 129.2249)  // (위도, 경도)
```

**중요**: 항상 위도/경도 순서를 확인하세요!

---

## 참고 문서
- [카카오 Mobility API](https://developers.kakaomobility.com/)
- [카카오맵 JavaScript API](https://apis.map.kakao.com/web/)
