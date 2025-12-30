import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { PloggingBottomPanel } from './ui/plogging-bottom-panel';
import { usePloggingStore } from '../stores/plogging-store';

const xSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6L6 18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 6L18 18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const searchVisualSvg = `
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_63_1672)">
<path d="M21.2143 16.5V19.6429C21.2143 20.0596 21.0487 20.4594 20.754 20.754C20.4594 21.0487 20.0596 21.2143 19.6429 21.2143H16.5" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 0.785645H19.6429C20.0596 0.785645 20.4594 0.951206 20.754 1.2459C21.0487 1.54061 21.2143 1.9403 21.2143 2.35707V5.49993" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.785645 5.49993V2.35707C0.785645 1.9403 0.951206 1.54061 1.2459 1.2459C1.54061 0.951206 1.9403 0.785645 2.35707 0.785645H5.49993" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.49993 21.2143H2.35707C1.9403 21.2143 1.54061 21.0487 1.2459 20.754C0.951206 20.4594 0.785645 20.0596 0.785645 19.6429V16.5" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.82146 14.5357C12.4251 14.5357 14.5357 12.4251 14.5357 9.82146C14.5357 7.21784 12.4251 5.10718 9.82146 5.10718C7.21784 5.10718 5.10718 7.21784 5.10718 9.82146C5.10718 12.4251 7.21784 14.5357 9.82146 14.5357Z" stroke="#F8FAFC" stroke-width="1.5"/>
<path d="M13.3572 13.3572L16.5 16.5" stroke="#F8FAFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_63_1672">
<rect width="22" height="22" fill="white"/>
</clipPath>
</defs>
</svg>
`;

const KAKAO_JS_API_KEY = 'eee93c472709b2e00c96b5bc6e935d4c';
const KAKAO_REST_API_KEY = '99e3fd064582ce7387fe6b1bc3eb1e9a';

interface Location {
  lat: number;
  lng: number;
  name?: string;
  grade?: 0 | 1 | 2 | 3; // 쓰레기 등급 (0은 내 위치)
}

interface SimpleRouteMapProps {
  locations: Location[];
  onReset?: () => void;
  onRouteCalculated?: (info: { distance: number; duration: number }) => void;
}

export default function SimpleRouteMap({ locations, onReset, onRouteCalculated }: SimpleRouteMapProps) {
  const navigation = useNavigation();
  const {
    isNavigating,
    setIsNavigating,
    completionPercentage,
    setCompletionPercentage,
    setRouteInfo: setGlobalRouteInfo,
    setGradeLocations,
    generatedRoutes, // 이미지 정보를 가져오기 위해 추가
  } = usePloggingStore();
  
  console.log('SimpleRouteMap rendered with props:', {
    locationsCount: locations.length,
    hasOnReset: !!onReset,
    hasNavigation: !!navigation,
    hasOnRouteCalculated: !!onRouteCalculated
  });
  
  const webViewRef = useRef<WebView>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<{ name: string; grade: number; images: string[] } | null>(null);
  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);
  const locationSubscription = useRef<any>(null);

  useEffect(() => {
    if (locations.length >= 1) {
      calculateRoute();
    }
  }, [locations]);

  useEffect(() => {
    console.log('isNavigating state changed to:', isNavigating);
  }, [isNavigating]);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 위치 추적 중지
      if (locationSubscription.current) {
        try {
          locationSubscription.current.remove();
        } catch (error) {
          console.log('Location subscription cleanup:', error);
        }
        locationSubscription.current = null;
      }
    };
  }, []);

  const startNavigation = async () => {
    console.log('=== startNavigation called ===');
    console.log('Current isNavigating state:', isNavigating);
    
    try {
      console.log('Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Permission denied');
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      // 현재 위치 가져오기
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const userLocation = {
        lat: currentPos.coords.latitude,
        lng: currentPos.coords.longitude,
      };
      
      console.log('Current user location:', userLocation);
      setCurrentLocation(userLocation);

      // WebView에 현재 위치로 지도 중심 이동 및 확대 (강제)
      if (webViewRef.current) {
        console.log('Centering map to user location with force');
        
        const centerMessage = JSON.stringify({
          type: 'centerToLocation',
          location: userLocation,
          zoom: 17,
          force: true,
        });
        
        // 안드로이드와 iOS 모두 지원하는 방식으로 전송
        const sendCenterMessage = () => {
          if (webViewRef.current) {
            // postMessage 방식
            webViewRef.current.postMessage(centerMessage);
            
            // injectJavaScript 방식 (안드로이드 백업)
            webViewRef.current.injectJavaScript(`
              (function() {
                try {
                  const data = ${centerMessage};
                  const center = new kakao.maps.LatLng(data.location.lat, data.location.lng);
                  if (typeof map !== 'undefined' && map) {
                    map.setCenter(center);
                    map.setLevel(4); // 레벨 4 = 확대
                    console.log('Map centered to:', data.location.lat, data.location.lng);
                  }
                } catch (e) {
                  console.error('Center map error:', e);
                }
              })();
              true;
            `);
          }
        };
        
        // 즉시 전송
        sendCenterMessage();
        
        // 200ms 후 재전송
        setTimeout(sendCenterMessage, 200);
        
        // 500ms 후 재전송
        setTimeout(sendCenterMessage, 500);
        
        // 1000ms 후 마지막 재전송
        setTimeout(sendCenterMessage, 1000);
      }

      console.log('Setting isNavigating to true');
      
      // 실시간 위치 추적 시작
      console.log('Starting location watch...');
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          console.log('Location update received:', location.coords.latitude, location.coords.longitude);
          const newLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setCurrentLocation(newLocation);

          // WebView에 위치 업데이트 전송
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updateNavigation',
              location: newLocation,
              heading: location.coords.heading || 0,
            }));
          }
        }
      );

      // WebView에 길안내 모드 시작 알림
      if (webViewRef.current) {
        console.log('Sending startNavigation message to WebView');
        webViewRef.current.postMessage(JSON.stringify({
          type: 'startNavigation',
        }));
      }

      // isNavigating을 마지막에 설정 (위치 추적이 성공적으로 시작된 후)
      setIsNavigating(true);
      setCompletionPercentage(0);
      console.log('isNavigating should now be true');

      console.log('=== Navigation started successfully ===');
    } catch (error) {
      console.error('=== 길안내 시작 오류 ===:', error);
      Alert.alert('오류', '길안내를 시작할 수 없습니다.');
      setIsNavigating(false);
    }
  };

  const confirmStopNavigation = () => {
    if (locationSubscription.current) {
      try {
        locationSubscription.current.remove();
      } catch (error) {
        console.log('Location subscription cleanup:', error);
      }
      locationSubscription.current = null;
    }

    setIsNavigating(false);
    setCurrentLocation(null);
    setCompletionPercentage(0);
    setStopConfirmVisible(false);

    // WebView에 길안내 모드 종료 알림
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'stopNavigation',
      }));
    }
  };

  const stopNavigation = () => {
    setStopConfirmVisible(true);
  };

  const calculateRoute = async () => {
    if (locations.length < 1) return;

    setLoading(true);
    let totalDistance = 0;
    let totalDuration = 0;
    const routes: Array<{ path: Array<{ x: number, y: number }>, color: string }> = [];

    try {
      // 현재 위치 가져오기
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        setLoading(false);
        return;
      }

      const currentPos = await Location.getCurrentPositionAsync({});
      const userLocation = {
        lat: currentPos.coords.latitude,
        lng: currentPos.coords.longitude,
        name: '내 위치'
      };

      // 내 위치를 시작점으로 하는 전체 경로 생성
      const allLocations = [userLocation, ...locations];

      // 구간별 색상 정의 (빨 -> 파 -> 초 -> 노)
      const segmentColors = [colors.Blue3, colors.Blue3, colors.Blue3, '#FFD700', '#FF00FF'];

      // 각 구간별로 경로 계산
      for (let i = 0; i < allLocations.length - 1; i++) {
        const origin = allLocations[i];
        const destination = allLocations[i + 1];

        const requestBody = {
          origin: {
            x: origin.lng.toString(),
            y: origin.lat.toString()
          },
          destination: {
            x: destination.lng.toString(),
            y: destination.lat.toString()
          },
          waypoints: [],
          priority: "RECOMMEND",
          car_fuel: "GASOLINE",
          car_hipass: false,
          alternatives: false,
          road_details: true
        };

        const response = await fetch('https://apis-navi.kakaomobility.com/v1/waypoints/directions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const summary = route.summary;

            totalDistance += summary.distance;
            totalDuration += summary.duration;

            // 경로 좌표 추출
            const pathCoords: Array<{ x: number, y: number }> = [];
            if (route.sections && route.sections.length > 0) {
              route.sections.forEach((section: any) => {
                if (section.roads && section.roads.length > 0) {
                  section.roads.forEach((road: any) => {
                    if (road.vertexes && road.vertexes.length > 0) {
                      for (let j = 0; j < road.vertexes.length; j += 2) {
                        pathCoords.push({
                          x: road.vertexes[j],
                          y: road.vertexes[j + 1]
                        });
                      }
                    }
                  });
                }
              });
            }

            // 구간별 색상 지정
            const color = segmentColors[i % segmentColors.length];

            routes.push({ path: pathCoords, color });
          }
        }
      }

      const calculatedRouteInfo = { distance: totalDistance, duration: totalDuration };
      setRouteInfo(calculatedRouteInfo);
      
      // Store in Zustand
      setGlobalRouteInfo(calculatedRouteInfo);
      
      // Store grade locations (중복 제거 및 정렬)
      const uniqueGrades = new Set<1 | 2 | 3>();
      locations.forEach(loc => {
        if (loc.grade) {
          uniqueGrades.add(loc.grade);
        }
      });
      
      // 등급 순서대로 정렬 (1, 2, 3)
      const gradeLocations = Array.from(uniqueGrades)
        .sort((a, b) => a - b)
        .map(grade => ({ grade }));
      
      console.log('Grade locations:', gradeLocations);
      setGradeLocations(gradeLocations);
      
      // Notify parent component
      if (onRouteCalculated) {
        onRouteCalculated(calculatedRouteInfo);
      }

      // WebView에 데이터 전송
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateRoute',
          locations: allLocations,
          routes
        }));
      }
    } catch (error) {
      console.error('경로 계산 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { 
      width: 100%; 
      height: 100%; 
    }
  </style>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    let map;
    let markers = [];
    let polylines = [];
    let allRoutes = [];
    let allLocations = [];
    let isNavigationMode = false;
    let currentUserMarker = null;
    let passedPolylines = [];

    // 지도 초기화
    function initMap() {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(35.1227, 128.8562),
        level: 6
      };
      map = new kakao.maps.Map(container, options);
      
      // 일반 지도 타입 사용 (ROADMAP)
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
    }

    // 두 점 사이의 거리 계산 (미터)
    function getDistance(lat1, lng1, lat2, lng2) {
      const R = 6371000; // 지구 반지름 (미터)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // 경로에서 가장 가까운 점 찾기
    function findClosestPointOnRoute(userLat, userLng, routes) {
      let minDistance = Infinity;
      let closestRouteIndex = -1;
      let closestPointIndex = -1;

      routes.forEach((route, routeIdx) => {
        route.path.forEach((point, pointIdx) => {
          const distance = getDistance(userLat, userLng, point.y, point.x);
          if (distance < minDistance) {
            minDistance = distance;
            closestRouteIndex = routeIdx;
            closestPointIndex = pointIdx;
          }
        });
      });

      return { routeIndex: closestRouteIndex, pointIndex: closestPointIndex, distance: minDistance };
    }

    // 경로 업데이트
    function updateRoute(locations, routes) {
      allLocations = locations;
      allRoutes = routes;

      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      // 기존 경로 제거
      polylines.forEach(polyline => polyline.setMap(null));
      polylines = [];

      // 마커 생성
      locations.forEach((location, index) => {
        const position = new kakao.maps.LatLng(location.lat, location.lng);
        
        // 첫 번째 마커 (내 위치)는 일반 마커 사용
        if (index === 0) {
          const imageSrc = 'data:image/svg+xml;base64,' + btoa(\`
            <svg width="40" height="46" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#filter0_d_7508_4625)">
                <path d="M20 12L28 34L20 30.3333L12 34L20 12Z" fill="white"/>
                <path d="M20 16L26 32L20 29.3333L14 32L20 16Z" fill="#155DFC"/>
              </g>
              <defs>
                <filter id="filter0_d_7508_4625" x="0" y="0" width="40" height="48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset/>
                  <feGaussianBlur stdDeviation="6"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.0823529 0 0 0 0 0.364706 0 0 0 0 0.988235 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7508_4625"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7508_4625" result="shape"/>
                </filter>
              </defs>
            </svg>
          \`);
          const imageSize = new kakao.maps.Size(40, 46);
          const imageOption = { offset: new kakao.maps.Point(20, 46) };
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

          const marker = new kakao.maps.Marker({
            position: position,
            image: markerImage,
            title: location.name || \`위치 \${index + 1}\`
          });

          marker.setMap(map);
          markers.push(marker);
        } else {
          // Grade 마커는 CustomOverlay 사용 (클릭 가능하도록)
          const grade = location.grade || 1;
          
          // 0등급(내 위치)은 마커 표시 안 함
          if (grade === 0) {
            console.log('Skipping marker for grade 0 (user location)');
            return;
          }
          
          let svgContent = '';
          let width = 126;
          
          if (grade === 1) {
            svgContent = \`<svg width="126" height="54" viewBox="0 0 126 54" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><rect x="43" y="14" width="40" height="40" rx="20" fill="#EF4444"/></g><rect x="0.5" y="0.5" width="125" height="23" rx="3.5" fill="#EF4444"/><rect x="0.5" y="0.5" width="125" height="23" rx="3.5" stroke="white"/><text x="63" y="16" font-family="Arial" font-size="11" fill="white" text-anchor="middle">쓰레기 밀집 예상 1등급</text><path d="M63 34L67 24H59L63 34Z" fill="#EF4444"/></svg>\`;
            width = 126;
          } else if (grade === 2) {
            svgContent = \`<svg width="127" height="54" viewBox="0 0 127 54" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><rect x="43" y="14" width="40" height="40" rx="20" fill="#F97316"/></g><rect x="0.5" y="0.5" width="126" height="23" rx="3.5" fill="#F97316"/><rect x="0.5" y="0.5" width="126" height="23" rx="3.5" stroke="white"/><text x="63.5" y="16" font-family="Arial" font-size="11" fill="white" text-anchor="middle">쓰레기 밀집 예상 2등급</text><path d="M63.5 34L67.5 24H59.5L63.5 34Z" fill="#F97316"/></svg>\`;
            width = 127;
          } else {
            svgContent = \`<svg width="128" height="54" viewBox="0 0 128 54" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><rect x="44" y="14" width="40" height="40" rx="20" fill="#EAB308"/></g><rect x="0.5" y="0.5" width="127" height="23" rx="3.5" fill="#EAB308"/><rect x="0.5" y="0.5" width="127" height="23" rx="3.5" stroke="white"/><text x="64" y="16" font-family="Arial" font-size="11" fill="white" text-anchor="middle">쓰레기 밀집 예상 3등급</text><path d="M64 34L68 24H60L64 34Z" fill="#EAB308"/></svg>\`;
            width = 128;
          }

          const overlayContent = document.createElement('div');
          overlayContent.style.cursor = 'pointer';
          overlayContent.style.position = 'relative';
          overlayContent.innerHTML = svgContent;
          
          overlayContent.onclick = function() {
            console.log('Overlay clicked! Grade:', grade, 'Name:', location.name);
            
            const message = JSON.stringify({
              type: 'markerClick',
              name: location.name || \`목적지 \${index}\`,
              grade: grade
            });
            
            console.log('Sending message:', message);
            
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(message);
              console.log('Message sent via ReactNativeWebView');
            } else if (window.postMessage) {
              window.postMessage(message, '*');
              console.log('Message sent via window.postMessage');
            }
          };

          const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: overlayContent,
            xAnchor: 0.5,
            yAnchor: 1,
            zIndex: 3
          });

          customOverlay.setMap(map);
          markers.push(customOverlay);
          
          console.log('CustomOverlay created for marker', index, 'with grade', grade);
        }
      });

      // 경로 그리기
      if (routes && routes.length > 0) {
        routes.forEach(route => {
          if (route.path && route.path.length > 0) {
            const linePath = route.path.map(coord => 
              new kakao.maps.LatLng(coord.y, coord.x)
            );

            // 흰색 테두리 (더 두꺼운 선)
            const polylineBorder = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 8,
              strokeColor: '#FFFFFF',
              strokeOpacity: 1,
              strokeStyle: 'solid',
              zIndex: 1
            });

            // 파란색 내부 (더 얇은 선)
            const polylineInner = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 5,
              strokeColor: '#155DFC',
              strokeOpacity: 1,
              strokeStyle: 'solid',
              zIndex: 2
            });

            polylineBorder.setMap(map);
            polylineInner.setMap(map);
            polylines.push(polylineBorder);
            polylines.push(polylineInner);
          }
        });
      }

      // 지도 범위 조정
      if (locations.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        locations.forEach(location => {
          bounds.extend(new kakao.maps.LatLng(location.lat, location.lng));
        });
        map.setBounds(bounds);
      }
    }

    // 길안내 모드 시작
    function startNavigation() {
      isNavigationMode = true;
      map.setLevel(2); // 줌 레벨 더 확대
      
      // 지도 타입을 로드뷰로 변경 (더 상세한 뷰)
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
    }

    // 길안내 모드 종료
    function stopNavigation() {
      isNavigationMode = false;
      
      // 사용자 마커 제거
      if (currentUserMarker) {
        currentUserMarker.setMap(null);
        currentUserMarker = null;
      }
      
      // 지나간 경로 제거
      passedPolylines.forEach(polyline => polyline.setMap(null));
      passedPolylines = [];
      
      // 원래 경로 복원
      if (allLocations.length > 0 && allRoutes.length > 0) {
        updateRoute(allLocations, allRoutes);
      }
    }

    // 실시간 위치 업데이트
    function updateNavigation(location, heading) {
      if (!isNavigationMode) return;

      const userPosition = new kakao.maps.LatLng(location.lat, location.lng);

      // 사용자 현재 위치 마커 업데이트
      if (currentUserMarker) {
        currentUserMarker.setPosition(userPosition);
        
        // 마커 이미지를 heading에 맞춰 회전
        if (heading !== null && heading !== undefined) {
          const userMarkerSrc = 'data:image/svg+xml;base64,' + btoa(\`
            <svg width="40" height="46" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(\${heading} 20 23)">
                <g filter="url(#filter0_d)">
                  <path d="M20 12L28 34L20 30.3333L12 34L20 12Z" fill="white"/>
                  <path d="M20 16L26 32L20 29.3333L14 32L20 16Z" fill="#155DFC"/>
                </g>
              </g>
              <defs>
                <filter id="filter0_d" x="0" y="0" width="40" height="48">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feGaussianBlur stdDeviation="6"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.0823529 0 0 0 0 0.364706 0 0 0 0 0.988235 0 0 0 1 0"/>
                  <feBlend mode="normal" result="effect1_dropShadow"/>
                </filter>
              </defs>
            </svg>
          \`);

          const userMarkerImage = new kakao.maps.MarkerImage(
            userMarkerSrc,
            new kakao.maps.Size(40, 46),
            { offset: new kakao.maps.Point(20, 46) }
          );

          currentUserMarker.setImage(userMarkerImage);
        }
      } else {
        // 사용자 마커 생성 (heading에 맞춰 회전)
        const markerHeading = heading !== null && heading !== undefined ? heading : 0;
        const userMarkerSrc = 'data:image/svg+xml;base64,' + btoa(\`
          <svg width="40" height="46" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(\${markerHeading} 20 23)">
              <g filter="url(#filter0_d)">
                <path d="M20 12L28 34L20 30.3333L12 34L20 12Z" fill="white"/>
                <path d="M20 16L26 32L20 29.3333L14 32L20 16Z" fill="#155DFC"/>
              </g>
            </g>
            <defs>
              <filter id="filter0_d" x="0" y="0" width="40" height="48">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feGaussianBlur stdDeviation="6"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.0823529 0 0 0 0 0.364706 0 0 0 0 0.988235 0 0 0 1 0"/>
                <feBlend mode="normal" result="effect1_dropShadow"/>
              </filter>
            </defs>
          </svg>
        \`);

        const userMarkerImage = new kakao.maps.MarkerImage(
          userMarkerSrc,
          new kakao.maps.Size(40, 46),
          { offset: new kakao.maps.Point(20, 46) }
        );

        currentUserMarker = new kakao.maps.Marker({
          position: userPosition,
          image: userMarkerImage,
          zIndex: 100
        });

        currentUserMarker.setMap(map);
      }

      // 지도 중심을 사용자 위치로 자동 이동 (비활성화)
      // map.panTo(userPosition);

      // 가장 가까운 경로 점 찾기
      const closest = findClosestPointOnRoute(location.lat, location.lng, allRoutes);

      if (closest.routeIndex >= 0 && closest.distance < 50) { // 50미터 이내
        // 지나간 경로 처리
        updatePassedRoute(closest.routeIndex, closest.pointIndex);
      }
    }

    // 지나간 경로 업데이트
    function updatePassedRoute(routeIndex, pointIndex) {
      // 기존 경로 제거
      polylines.forEach(polyline => polyline.setMap(null));
      polylines = [];

      // 경로 다시 그리기
      allRoutes.forEach((route, rIdx) => {
        if (route.path && route.path.length > 0) {
          let pathToDraw = route.path;

          // 현재 구간이면 지나간 부분 제외
          if (rIdx === routeIndex) {
            pathToDraw = route.path.slice(pointIndex);
          }
          // 이전 구간은 완전히 제외
          else if (rIdx < routeIndex) {
            return;
          }

          if (pathToDraw.length > 0) {
            const linePath = pathToDraw.map(coord => 
              new kakao.maps.LatLng(coord.y, coord.x)
            );

            // 흰색 테두리 (더 두꺼운 선)
            const polylineBorder = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 8,
              strokeColor: '#FFFFFF',
              strokeOpacity: 1,
              strokeStyle: 'solid',
              zIndex: 1
            });

            // 파란색 내부 (더 얇은 선)
            const polylineInner = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 5,
              strokeColor: '#155DFC',
              strokeOpacity: 1,
              strokeStyle: 'solid',
              zIndex: 2
            });

            polylineBorder.setMap(map);
            polylineInner.setMap(map);
            polylines.push(polylineBorder);
            polylines.push(polylineInner);
          }
        }
      });
    }

    // 메시지 수신
    document.addEventListener('message', function(e) {
      const data = JSON.parse(e.data);
      if (data.type === 'updateRoute') {
        updateRoute(data.locations, data.routes);
      } else if (data.type === 'startNavigation') {
        startNavigation();
      } else if (data.type === 'stopNavigation') {
        stopNavigation();
      } else if (data.type === 'updateNavigation') {
        updateNavigation(data.location, data.heading);
      }
    });

    window.addEventListener('message', function(e) {
      const data = JSON.parse(e.data);
      if (data.type === 'updateRoute') {
        updateRoute(data.locations, data.routes);
      } else if (data.type === 'startNavigation') {
        startNavigation();
      } else if (data.type === 'stopNavigation') {
        stopNavigation();
      } else if (data.type === 'updateNavigation') {
        updateNavigation(data.location, data.heading);
      } else if (data.type === 'centerToLocation') {
        // 지도를 특정 위치로 이동하고 확대
        const center = new kakao.maps.LatLng(data.location.lat, data.location.lng);
        map.setCenter(center);
        if (data.zoom) {
          map.setLevel(21 - data.zoom); // Kakao 지도는 레벨이 낮을수록 확대 (1-14)
        }
      }
    });

    initMap();
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={`
          console.log('WebView initialized');
          console.log('ReactNativeWebView available:', typeof window.ReactNativeWebView !== 'undefined');
          true;
        `}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('📩 [Map] 메시지 수신:', data);
            if (data.type === 'markerClick') {
              console.log('🎯 [Map] 마커 클릭:', data.name, 'grade:', data.grade);
              
              // Zustand에서 해당 경로의 이미지 찾기
              const matchedRoute = generatedRoutes.find(
                r => r.destination_name === data.name
              );
              
              const images = matchedRoute?.scrapedImages || [];
              console.log('📸 [Map] 찾은 이미지:', images.length, '개');
              console.log('📸 [Map] 이미지 URLs:', images);
              
              setSelectedMarker({
                name: data.name,
                grade: data.grade,
                images: images
              });
              setModalVisible(true);
            }
          } catch (error) {
            console.log('❌ [Map] 메시지 파싱 에러:', error);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        )}
      />

      {/* Bottom Panel */}
      <PloggingBottomPanel
        onStartStop={isNavigating ? () => setStopConfirmVisible(true) : startNavigation}
        collapsed={isPanelCollapsed}
        onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>경로 계산 중...</Text>
        </View>
      )}

      {/* Grade Info Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <SvgXml xml={xSvg} width={24} height={24} />
            </TouchableOpacity>
            
            {selectedMarker && (
              <>
                <Text style={styles.modalTitle}>{selectedMarker.name}</Text>
                <View style={styles.gradeInfoContainer}>
                  <Text style={styles.gradeLabel}>쓰레기 밀집 등급</Text>
                  <View style={[
                    styles.gradeBadge,
                    selectedMarker.grade === 1 && styles.gradeBadge1,
                    selectedMarker.grade === 2 && styles.gradeBadge2,
                    selectedMarker.grade === 3 && styles.gradeBadge3,
                  ]}>
                    <Text style={styles.gradeBadgeText}>{selectedMarker.grade}등급</Text>
                  </View>
                </View>
                <Text style={styles.gradeDescription}>
                  {selectedMarker.grade === 1 && '쓰레기가 매우 많이 밀집된 지역입니다.'}
                  {selectedMarker.grade === 2 && '쓰레기가 중간 정도 밀집된 지역입니다.'}
                  {selectedMarker.grade === 3 && '쓰레기가 적게 밀집된 지역입니다.'}
                </Text>
                
                {/* 이미지 섹션 */}
                {selectedMarker.images && selectedMarker.images.length > 0 && (
                  <View style={styles.imagesSection}>
                    <Text style={styles.imagesSectionTitle}>현장 사진</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.imagesContainer}
                    >
                      {selectedMarker.images.map((imageUrl, index) => (
                        <View key={index} style={styles.imageWrapper}>
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.modalImage}
                            resizeMode="cover"
                            onError={(error) => {
                              console.error('❌ [Modal] 이미지 로드 실패:', imageUrl, error.nativeEvent.error);
                            }}
                            onLoad={() => {
                              console.log('✅ [Modal] 이미지 로드 성공:', imageUrl);
                            }}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Stop Confirmation Modal */}
      <Modal
        visible={stopConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStopConfirmVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>정말 그만두시겠습니까?</Text>
            <Text style={styles.confirmMessage}>
              완주하지 않고 그만둘 경우, 
진행도는 저장되거나 기록되지 않습니다
            </Text>
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.continueButton]}
                onPress={() => setStopConfirmVisible(false)}
              >
                <Text style={styles.continueButtonText}>계속하기</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.quitButton]}
                onPress={confirmStopNavigation}
              >
                <Text style={styles.confirmButtonText}>그만두기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigation Buttons */}
      {!isNavigating && onReset && (
        <TouchableOpacity style={styles.backButton} onPress={onReset}>
          <Text style={styles.backButtonText}>← 다시 입력</Text>
        </TouchableOpacity>
      )}

      {isNavigating && (
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={() => {
            console.log('Camera button pressed - navigating to plogging-camera');
            navigation.navigate('plogging-camera' as never);
          }}
        >
          <SvgXml xml={searchVisualSvg} width={22} height={22} />
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
    paddingRight: 32,
  },
  gradeInfoContainer: {
    marginBottom: 16,
  },
  gradeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  gradeBadge1: {
    backgroundColor: '#EF4444',
  },
  gradeBadge2: {
    backgroundColor: '#F97316',
  },
  gradeBadge3: {
    backgroundColor: '#EAB308',
  },
  gradeBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  gradeDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  cameraButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quitButton: {
    backgroundColor: '#000000',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  imagesSection: {
    marginTop: 24,
    gap: 12,
  },
  imagesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  imagesContainer: {
    gap: 12,
  },
  imageWrapper: {
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.Border2,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
