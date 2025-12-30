// 여행지 데이터 타입 정의
export interface TravelMarker {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: 1 | 2 | 3; // 1: 음식점, 2: 관광지, 3: 숙소
  day: number;
  isApiMarker?: boolean;
  grade?: 1 | 2 | 3; // 쓰레기 등급 (있으면 쓰레기 마커로 표시)
  isUserPosition?: boolean; // 사용자 위치 마커 여부
}

// 카테고리 정보
export const CATEGORIES = {
  1: { name: '음식점', color: '#ff6b6b', icon: '🍴' },
  2: { name: '관광지', color: '#ff69b4', icon: '🏛️' },
  3: { name: '숙소', color: '#4dabf7', icon: '🏨' }
} as const;

// 경로 정보 타입 정의
export interface RouteInfo {
  from: number;
  to: number;
  distance?: number;
  duration?: number;
  taxi_fare?: number;
  path?: Array<{x: number, y: number}>;
}

// 초기 여행지 데이터
export const travelMarkers: TravelMarker[] = [
  {
    id: 1,
    name: "시즈닝",
    lat: 35.8560,
    lng: 129.2249,
    category: 1,
    day: 1
  },
  {
    id: 2,
    name: "대릉원",
    lat: 35.8345,
    lng: 129.2248,
    category: 2,
    day: 1
  },
  {
    id: 3,
    name: "안압지",
    lat: 35.8347,
    lng: 129.2244,
    category: 2,
    day: 1
  },
  {
    id: 4,
    name: "코모도 호텔",
    lat: 35.8290,
    lng: 129.2180,
    category: 3,
    day: 1
  }
];
