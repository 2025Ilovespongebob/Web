import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import type { TravelMarker } from '../types/travel';

const KAKAO_JS_API_KEY = 'eee93c472709b2e00c96b5bc6e935d4c';

interface KakaoMapViewProps {
  markers: TravelMarker[];
  selectedDay: number;
  isAddingMode?: boolean;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  onMarkerClick?: (marker: TravelMarker) => void;
  routes?: Array<{ from: number; to: number; path?: Array<{ x: number; y: number }> }>;
  initialLocation?: { lat: number; lng: number } | null;
}

export default function KakaoMapView({
  markers,
  selectedDay,
  isAddingMode = false,
  onLocationSelect,
  onMarkerClick,
  routes = [],
  initialLocation = null,
}: KakaoMapViewProps) {
  const webViewRef = useRef<WebView>(null);

  const dayMarkers = markers.filter(m => m.day === selectedDay);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateMarkers',
        markers: dayMarkers,
        routes
      }));
    }
  }, [dayMarkers, routes]);

  useEffect(() => {
    if (webViewRef.current && initialLocation) {
      // 위치가 업데이트되면 여러 번 메시지 전송 (확실하게)
      const sendLocationUpdate = () => {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'setInitialLocation',
          location: initialLocation,
        }));
      };

      // 즉시 전송
      sendLocationUpdate();
      
      // 0.2초, 0.5초, 1초 후에도 전송 (지도 로딩 대기)
      setTimeout(sendLocationUpdate, 200);
      setTimeout(sendLocationUpdate, 500);
      setTimeout(sendLocationUpdate, 1000);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'setAddingMode',
        isAddingMode
      }));
    }
  }, [isAddingMode]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'locationSelected' && onLocationSelect) {
        onLocationSelect({ lat: data.lat, lng: data.lng });
      } else if (data.type === 'markerClicked' && onMarkerClick) {
        const marker = dayMarkers.find(m => m.id === data.markerId);
        if (marker) {
          onMarkerClick(marker);
        }
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
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
    #map { width: 100%; height: 100%; }
  </style>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    let map;
    let markers = [];
    let polylines = [];
    let isAddingMode = false;

    // 지도 초기화
    function initMap() {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(35.1227, 128.8562),
        level: 6
      };
      map = new kakao.maps.Map(container, options);

      // 지도 클릭 이벤트
      kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        if (isAddingMode) {
          const latlng = mouseEvent.latLng;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            lat: latlng.getLat(),
            lng: latlng.getLng()
          }));
        }
      });
    }

    // 마커 업데이트
    function updateMarkers(newMarkers, routes) {
      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      // 기존 경로 제거
      polylines.forEach(polyline => polyline.setMap(null));
      polylines = [];

      // 새 마커 생성
      newMarkers.forEach((markerData, index) => {
        const position = new kakao.maps.LatLng(markerData.lat, markerData.lng);
        
        // 카테고리별 색상
        const colors = {
          1: '#ff6b6b',
          2: '#ff69b4',
          3: '#4dabf7'
        };

        // 커스텀 마커 이미지
        const imageSrc = 'data:image/svg+xml;base64,' + btoa(\`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" 
                  fill="\${colors[markerData.category]}" stroke="white" stroke-width="2"/>
            <text x="20" y="25" font-size="16" font-weight="bold" fill="white" text-anchor="middle">\${index + 1}</text>
          </svg>
        \`);
        
        const imageSize = new kakao.maps.Size(40, 50);
        const imageOption = { offset: new kakao.maps.Point(20, 50) };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new kakao.maps.Marker({
          position: position,
          image: markerImage,
          title: markerData.name
        });

        marker.setMap(map);
        markers.push(marker);

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClicked',
            markerId: markerData.id
          }));
        });
      });

      // 경로 그리기
      if (routes && routes.length > 0) {
        routes.forEach(route => {
          if (route.path && route.path.length > 0) {
            const linePath = route.path.map(coord => 
              new kakao.maps.LatLng(coord.y, coord.x)
            );

            const polyline = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 5,
              strokeColor: '#FF6B6B',
              strokeOpacity: 0.7,
              strokeStyle: 'solid'
            });

            polyline.setMap(map);
            polylines.push(polyline);
          }
        });
      }

      // 마커가 있으면 지도 범위 조정
      if (newMarkers.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        newMarkers.forEach(markerData => {
          bounds.extend(new kakao.maps.LatLng(markerData.lat, markerData.lng));
        });
        map.setBounds(bounds);
      }
    }

    // React Native에서 메시지 수신
    document.addEventListener('message', function(e) {
      const data = JSON.parse(e.data);
      
      if (data.type === 'updateMarkers') {
        updateMarkers(data.markers, data.routes);
      } else if (data.type === 'setAddingMode') {
        isAddingMode = data.isAddingMode;
      } else if (data.type === 'setInitialLocation') {
        const center = new kakao.maps.LatLng(data.location.lat, data.location.lng);
        map.setCenter(center);
        map.setLevel(5); // 적절한 줌 레벨
        console.log('지도 중심 이동 (Android):', data.location.lat, data.location.lng);
      }
    });

    // iOS용
    window.addEventListener('message', function(e) {
      const data = JSON.parse(e.data);
      
      if (data.type === 'updateMarkers') {
        updateMarkers(data.markers, data.routes);
      } else if (data.type === 'setAddingMode') {
        isAddingMode = data.isAddingMode;
      } else if (data.type === 'setInitialLocation') {
        const center = new kakao.maps.LatLng(data.location.lat, data.location.lng);
        map.setCenter(center);
        map.setLevel(5); // 적절한 줌 레벨
        console.log('지도 중심 이동 (iOS):', data.location.lat, data.location.lng);
      }
    });

    // 지도 초기화 실행
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
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        )}
      />
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
});
