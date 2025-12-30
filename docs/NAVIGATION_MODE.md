# 길안내 모드 가이드

## 개요
실시간 위치 추적을 통해 경로를 따라가면서 지나간 경로가 자동으로 지워지는 길안내 기능입니다.
**3D 기울임과 방향 회전 기능이 추가되어 더욱 직관적인 내비게이션을 제공합니다.**

---

## 주요 기능

### ✅ 실시간 위치 추적
- GPS를 사용하여 1초마다 위치 업데이트
- 5미터 이상 이동 시 자동 업데이트

### ✅ 3D 지도 기울임
- 길안내 시작 시 지도가 45도 기울어짐
- 3D 원근감 효과로 더 직관적인 뷰

### ✅ 방향 회전
- 이동 방향에 따라 지도가 자동 회전
- 진행 방향이 항상 위쪽을 향함
- 부드러운 애니메이션 효과

### ✅ 지도 자동 조정
- 사용자 위치를 중심으로 지도 이동
- 줌 레벨 자동 확대 (레벨 2)

### ✅ 방향 표시
- 파란색 화살표로 현재 위치 표시
- **아이콘이 실제 이동 방향으로 회전**
- 지도가 회전해도 아이콘은 실제 방향 유지
- 북쪽 기준 0도에서 시작하여 360도 회전

### ✅ 경로 진행 표시
- 지나간 경로는 자동으로 제거
- 남은 경로만 표시
- 50미터 이내 접근 시 경로 업데이트

---

## 사용 방법

### 1. 경로 설정
1. Map 탭 선택
2. 위도/경도 입력
3. "경로 보기" 버튼 클릭

### 2. 길안내 시작
1. 화면 하단의 "🧭 길안내 시작" 버튼 클릭
2. 위치 권한 허용
3. 실시간 위치 추적 시작

### 3. 길안내 중
- 지도가 45도 기울어짐 (3D 효과)
- 이동 방향에 따라 지도 자동 회전
- 진행 방향이 항상 위쪽
- **파란 화살표 아이콘이 실제 방향으로 회전**
- 경로를 따라 이동하면 지나간 부분 제거

### 4. 길안내 종료
1. "🛑 길안내 중지" 버튼 클릭
2. 위치 추적 중지
3. 지도 기울임 및 회전 초기화
4. 전체 경로 다시 표시

---

## 3D 효과 설명

### 기울임 (Tilt)
```css
transform: perspective(1000px) rotateX(45deg);
```
- **perspective**: 원근감 효과 (1000px)
- **rotateX(45deg)**: X축 기준 45도 회전 (위에서 내려다보는 각도)

### 회전 (Rotation)
```javascript
const rotation = -heading; // GPS 방향값
transform: rotateZ(${rotation}deg);
```
- **heading**: GPS에서 받은 방향 (0-360도)
  - 0도 = 북쪽
  - 90도 = 동쪽
  - 180도 = 남쪽
  - 270도 = 서쪽
- **-heading**: 반대로 회전하여 진행 방향이 위를 향하도록

### 결합 효과
```css
transform: perspective(1000px) rotateX(45deg) rotateZ(-heading);
```
- 45도 기울임 + 방향에 따른 회전
- 부드러운 전환 애니메이션 (0.3초)

---

## 작동 원리

### 위치 추적
```typescript
Location.watchPositionAsync({
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 1000,      // 1초마다
  distanceInterval: 5,     // 5미터마다
})
```

### 경로 진행 계산
```javascript
// 1. 사용자 위치와 경로의 모든 점 사이 거리 계산
// 2. 가장 가까운 점 찾기
// 3. 50미터 이내면 해당 점까지 경로 제거
// 4. 남은 경로만 다시 그리기
```

### 지도 업데이트
```javascript
// 사용자 위치로 지도 중심 이동
map.panTo(userPosition);

// 지나간 경로 제거
route.path.slice(pointIndex); // 현재 위치 이후만 유지
```

---

## 데이터 흐름

```
[GPS 위치 감지]
  ↓
위도: 35.8560, 경도: 129.2249
방향: 45도 (북동쪽)
  ↓
[WebView로 전송]
  ↓
{
  type: 'updateNavigation',
  location: { lat: 35.8560, lng: 129.2249 },
  heading: 45
}
  ↓
[가장 가까운 경로 점 찾기]
  ↓
구간 1, 포인트 50 (거리: 15m)
  ↓
[경로 업데이트]
  ↓
- 구간 1: 포인트 0~49 제거 (지나감)
- 구간 1: 포인트 50~끝 유지
- 구간 2, 3: 전체 유지
  ↓
[지도 표시]
  ↓
남은 경로만 표시
```

---

## 시각적 효과

### 길안내 시작 전
```
지도 레벨: 6 (넓은 범위)
기울임: 없음 (평면)
회전: 없음 (북쪽이 위)
마커: 내 위치 + 목적지들
경로: 전체 경로 표시
```

### 길안내 시작 후
```
지도 레벨: 2 (확대)
기울임: 45도 (3D 효과)
회전: 이동 방향에 따라 자동 회전
마커: 실시간 위치 (파란 화살표) + 목적지들
경로: 남은 경로만 표시
중심: 사용자 위치 자동 추적
애니메이션: 0.3초 부드러운 전환
```

### 시각적 비교
```
일반 모드:
┌─────────────┐
│   ↑ 북      │  평면 뷰
│   지도      │  고정된 방향
└─────────────┘

길안내 모드:
    ╱─────╲
   ╱   ↑   ╲     3D 기울임
  ╱  진행방향 ╲   회전하는 지도
 ╱___________╲
```

---

## 설정 조정

### 기울임 각도
**파일**: `sea-vision-rn/components/simple-route-map.tsx`

```css
/* 현재 설정 */
transform: perspective(1000px) rotateX(45deg);

/* 더 기울이기 */
transform: perspective(1000px) rotateX(60deg);

/* 덜 기울이기 */
transform: perspective(1000px) rotateX(30deg);

/* 기울임 없음 */
transform: perspective(1000px) rotateX(0deg);
```

### 원근감 조정
```css
/* 현재 설정 */
perspective(1000px)

/* 더 강한 원근감 */
perspective(500px)

/* 더 약한 원근감 */
perspective(2000px)
```

### 회전 애니메이션 속도
```css
transition: transform 0.3s ease-out;

/* 더 빠르게 */
transition: transform 0.1s ease-out;

/* 더 부드럽게 */
transition: transform 0.5s ease-out;

/* 애니메이션 없음 */
transition: none;
```

### 위치 업데이트 주기
**파일**: `sea-vision-rn/components/simple-route-map.tsx`

```typescript
Location.watchPositionAsync({
  timeInterval: 1000,      // 1000ms = 1초
  distanceInterval: 5,     // 5미터
})

// 더 빠른 업데이트
timeInterval: 500,         // 0.5초
distanceInterval: 2,       // 2미터

// 더 느린 업데이트 (배터리 절약)
timeInterval: 3000,        // 3초
distanceInterval: 10,      // 10미터
```

### 경로 제거 거리
```javascript
if (closest.distance < 50) { // 50미터 이내
  updatePassedRoute(...);
}

// 더 민감하게
if (closest.distance < 20) { // 20미터

// 덜 민감하게
if (closest.distance < 100) { // 100미터
```

### 지도 줌 레벨
```javascript
function startNavigation() {
  map.setLevel(2); // 2 = 매우 확대
}

// 더 확대
map.setLevel(1);

// 덜 확대
map.setLevel(3);
```

---

## 방향 계산

### GPS Heading 값
```
  0° (북)
    ↑
270° ← → 90°
    ↓
  180° (남)
```

### 지도 회전 로직
```javascript
// GPS heading: 90도 (동쪽으로 이동 중)
// 지도 회전: -90도 (지도를 반시계방향으로 90도 회전)
// 결과: 동쪽이 위를 향함

const rotation = -heading;
transform: rotateZ(${rotation}deg);
```

### 아이콘 회전 로직
```javascript
// GPS heading: 90도 (동쪽으로 이동 중)
// 아이콘 회전: +90도 (아이콘을 시계방향으로 90도 회전)
// 결과: 아이콘이 동쪽을 가리킴

<g transform="rotate(${heading} 20 23)">
  <!-- 화살표 SVG -->
</g>
```

### 시각적 설명
```
북쪽으로 이동 (0도):
  지도: 회전 없음
  아이콘: ↑ (북쪽)
  
동쪽으로 이동 (90도):
  지도: -90도 회전 (동쪽이 위로)
  아이콘: → (동쪽)
  
남쪽으로 이동 (180도):
  지도: -180도 회전 (남쪽이 위로)
  아이콘: ↓ (남쪽)
  
서쪽으로 이동 (270도):
  지도: -270도 회전 (서쪽이 위로)
  아이콘: ← (서쪽)
```

### 결과
- 지도는 진행 방향이 위를 향하도록 회전
- 아이콘은 실제 이동 방향을 가리킴
- 사용자는 아이콘을 보고 실제 방향 파악 가능

---

## 아이콘 회전 상세

### SVG Transform
```xml
<svg width="40" height="46" viewBox="0 0 40 46">
  <g transform="rotate(${heading} 20 23)">
    <!-- 20, 23 = 회전 중심점 (아이콘 중앙) -->
    <path d="M20 12L28 34L20 30.3333L12 34L20 12Z"/>
  </g>
</svg>
```

### 회전 중심점
```
(20, 23) = 아이콘의 중심
- X: 40 / 2 = 20
- Y: 46 / 2 = 23
```

### 동적 업데이트
```javascript
// 위치가 업데이트될 때마다
if (currentUserMarker) {
  // 새로운 heading 값으로 아이콘 재생성
  const newMarkerImage = createRotatedMarker(heading);
  currentUserMarker.setImage(newMarkerImage);
}
```

### 실시간 회전
- GPS에서 heading 값 수신 (1초마다)
- SVG에 heading 값 적용
- 마커 이미지 업데이트
- 부드러운 방향 전환

---

## 고급 기능

### 음성 안내 추가
```typescript
import * as Speech from 'expo-speech';

// 목적지 접근 시
if (distanceToDestination < 100) {
  Speech.speak('목적지에 도착했습니다.');
}

// 방향 전환 시
if (needTurn) {
  Speech.speak('100미터 앞에서 우회전하세요.');
}
```

### 속도 표시
```typescript
const speed = location.coords.speed; // m/s
const speedKmh = (speed * 3.6).toFixed(0); // km/h

<Text>현재 속도: {speedKmh} km/h</Text>
```

### 남은 거리/시간 표시
```typescript
const remainingDistance = calculateRemainingDistance();
const remainingTime = calculateRemainingTime();

<Text>남은 거리: {remainingDistance}km</Text>
<Text>도착 예정: {remainingTime}분</Text>
```

---

## 문제 해결

### 위치가 업데이트 안 돼요
1. 위치 권한 확인
2. GPS 켜져 있는지 확인
3. 실외에서 테스트 (GPS 신호)

### 경로가 안 지워져요
1. 경로에서 50미터 이내로 접근했는지 확인
2. 실제로 이동하고 있는지 확인
3. 거리 임계값 조정 (50 → 100)

### 지도가 너무 빨리 회전해요
1. 애니메이션 속도 조정 (0.3s → 0.5s)
2. heading 값 필터링 (급격한 변화 무시)

### 지도가 어지러워요
1. 기울임 각도 줄이기 (45deg → 30deg)
2. 회전 비활성화 (heading 사용 안 함)
3. 애니메이션 속도 늦추기

### 3D 효과가 안 보여요
1. 브라우저 하드웨어 가속 확인
2. perspective 값 조정
3. CSS transform 지원 확인

### 배터리가 빨리 닳아요
1. 위치 정확도 낮추기
2. 업데이트 주기 늘리기
3. 사용 후 길안내 중지

---

## 성능 최적화

### 배터리 절약
```typescript
// 정확도 낮추기
accuracy: Location.Accuracy.Balanced, // BestForNavigation 대신

// 업데이트 주기 늘리기
timeInterval: 2000,
distanceInterval: 10,
```

### 메모리 절약
```typescript
// 컴포넌트 언마운트 시 정리
useEffect(() => {
  return () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  };
}, []);
```

---

## 실전 팁

### 1. 실외에서 테스트
- GPS는 실내에서 정확도가 낮음
- 건물 밖에서 테스트 권장

### 2. 이동하면서 테스트
- 정지 상태에서는 경로가 안 지워짐
- 실제로 걸어가면서 테스트

### 3. 배터리 관리
- 길안내 사용 후 반드시 중지
- 백그라운드에서도 위치 추적 가능

### 4. 정확도
- 도심: 5-10미터 오차
- 교외: 10-20미터 오차
- 실내: 50미터 이상 오차

---

## 향후 개선 사항

### 계획 중인 기능
- [ ] 음성 안내
- [ ] 속도 표시
- [ ] 남은 거리/시간 실시간 업데이트
- [ ] 경로 이탈 감지 및 재탐색
- [ ] 교통 정보 표시
- [ ] 야간 모드
- [ ] 경로 녹화 및 저장

---

## 참고
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- 카카오맵 API: https://apis.map.kakao.com/web/
