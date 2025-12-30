import { useState, useCallback } from 'react';
import type { TravelMarker, RouteInfo } from '../types/travel';

const KAKAO_REST_API_KEY = '99e3fd064582ce7387fe6b1bc3eb1e9a';

export const useKakaoRoute = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRouteInfo = useCallback(async (origin: TravelMarker, destination: TravelMarker): Promise<RouteInfo | null> => {
    console.log(`🚗 카카오 API 경로 요청: ${origin.name} → ${destination.name}`);
    setLoading(true);
    setError(null);
    
    try {
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

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const summary = route.summary;
        
        const pathCoords: Array<{x: number, y: number}> = [];
        
        if (route.sections && route.sections.length > 0) {
          route.sections.forEach((section: any) => {
            if (section.roads && section.roads.length > 0) {
              section.roads.forEach((road: any) => {
                if (road.vertexes && road.vertexes.length > 0) {
                  for (let i = 0; i < road.vertexes.length; i += 2) {
                    pathCoords.push({
                      x: road.vertexes[i],
                      y: road.vertexes[i + 1]
                    });
                  }
                }
              });
            }
          });
        }

        const result = {
          from: origin.id,
          to: destination.id,
          distance: summary.distance,
          duration: summary.duration,
          taxi_fare: summary.fare?.taxi || calculateTaxiFare(summary.distance),
          path: pathCoords.length > 0 ? pathCoords : undefined
        };

        return result;
      } else {
        throw new Error('API 응답에 경로 데이터 없음');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('💥 카카오 API 요청 중 오류 발생:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getRouteInfo,
    loading,
    error
  };
};

const calculateTaxiFare = (distance: number): number => {
  const baseFare = 4800;
  const distanceFare = Math.round((distance / 1000) * 1000);
  return baseFare + distanceFare;
};
