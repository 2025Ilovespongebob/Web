import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

interface GenerateCourseRequest {
  latitude: number;
  longitude: number;
}

interface PathPoint {
  x: number;
  y: number;
}

interface RouteSegment {
  segment_id: number;
  type: string;
  destination_name: string;
  trash_grade: 1 | 2 | 3 | 0;
  path: PathPoint[];
  scrapedImages: string[];
}

interface GenerateCourseResponse {
  status: string;
  meta: {
    weather: string;
    total_segments: number;
    distance: number;
    spotCount: number;
  };
  routes: RouteSegment[];
}

export const useGenerateCourse = () => {
  return useMutation({
    mutationFn: async (request: GenerateCourseRequest): Promise<GenerateCourseResponse> => {
      console.log('🗺️ [Generate Course] 경로 생성 요청 시작');
      console.log('   위도:', request.latitude);
      console.log('   경도:', request.longitude);
      
      const response = await axiosInstance.post<GenerateCourseResponse>(
        '/api/v1/plogging/generate-course',
        request
      );
      
      console.log('✅ [Generate Course] 경로 생성 성공');
      console.log('   상태:', response.data.status);
      console.log('   날씨:', response.data.meta.weather);
      console.log('   총 구간 수:', response.data.meta.total_segments);
      console.log('   총 거리:', response.data.meta.distance, 'm');
      console.log('   스팟 수:', response.data.meta.spotCount);
      console.log('   경로 수:', response.data.routes.length);
      
      // 각 경로 정보 출력
      response.data.routes.forEach((route, index) => {
        console.log(`   경로 ${index + 1}:`, route.destination_name, `(등급 ${route.trash_grade})`);
      });
      
      return response.data;
    },
    onError: (error: any) => {
      console.error('❌ [Generate Course] 경로 생성 실패');
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      } else if (error.request) {
        console.error('   타임아웃 또는 네트워크 에러');
        console.error('   Message:', error.message);
      } else {
        console.error('   Error:', error);
      }
    },
  });
};

// 경로 데이터를 지도용 위치 데이터로 변환
export const convertRoutesToLocations = (routes: RouteSegment[]) => {
  return routes
    .filter((route) => route.trash_grade !== 0) // 0등급(내 위치) 제외
    .map((route) => ({
      lat: route.path[route.path.length - 1].y, // 마지막 지점의 위도
      lng: route.path[route.path.length - 1].x, // 마지막 지점의 경도
      name: route.destination_name,
      grade: route.trash_grade,
    }));
};
