// hooks/use-main-report.ts
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { MainReportResponse } from '@/types/main-report';

// 메인 리포트 조회
export const useMainReport = () => {
  return useQuery<MainReportResponse>({
    queryKey: ['mainReport'],
    queryFn: async () => {
      // 임시 목 데이터 사용
      console.log('📊 [Main Report] 목 데이터 사용');
      
      const mockData: MainReportResponse = {
        todayCount: 3,
        todayDistance: 2500,
        todayTime: '01:15:30',
        todayTrashCount: 45,
        carbonReduction: 3.75,
        todayRoutes: [
          {
            sequenceOrder: 1,
            destinationName: '명지항',
            trashGrade: 3,
            description: '1.2km',
            imageUrl1: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTA5MjFfMjc2%2FMDAxNjMyMjIxODYzMzgw.3lSE3lAHOXw3pYmJZ0LVvWnoKgLfmAUB1IA-AhvLfS4g.yvH5vHQK48-DpLXxLlx9bENzUGkuHqnu8m0ZktMKW3wg.JPEG.kigg55%2F55.jpg&type=f54_54',
            imageUrl2: '',
          },
          {
            sequenceOrder: 2,
            destinationName: '녹산항남방파제등대',
            trashGrade: 2,
            description: '0.8km',
            imageUrl1: '',
            imageUrl2: '',
          },
          {
            sequenceOrder: 3,
            destinationName: '녹산항',
            trashGrade: 1,
            description: '0.5km',
            imageUrl1: '',
            imageUrl2: '',
          },
        ],
        WeeklyRecords: [
          // 이번주: 12월 30일(월) ~ 1월 5일(일)
          { dayOfWeek: 'Mon', status: 'COMPLETED', trashCount: 12 },    // 12/30 (월) - 완료
          { dayOfWeek: 'Tue', status: 'TODAY', trashCount: 45 },        // 12/31 (화) - 오늘
          { dayOfWeek: 'Wed', status: 'FUTURE', trashCount: 0 },        // 1/1 (수) - 미래
          { dayOfWeek: 'Thu', status: 'FUTURE', trashCount: 0 },        // 1/2 (목) - 미래
          { dayOfWeek: 'Fri', status: 'FUTURE', trashCount: 0 },        // 1/3 (금) - 미래
          { dayOfWeek: 'Sat', status: 'FUTURE', trashCount: 0 },        // 1/4 (토) - 미래
          { dayOfWeek: 'Sun', status: 'FUTURE', trashCount: 0 },        // 1/5 (일) - 미래
        ],
      };
      
      console.log('✅ [Main Report] 목 데이터 반환');
      console.log('   오늘 완주 횟수:', mockData.todayCount);
      console.log('   오늘 경로 수:', mockData.todayRoutes?.length || 0);
      console.log('   주간 기록 수:', mockData.WeeklyRecords?.length || 0);
      
      return mockData;
      
      /* 실제 API 호출 코드 (임시로 주석 처리)
      try {
        console.log('📊 [Main Report] 메인 리포트 조회 시작');
        
        const { data } = await axiosInstance.get<MainReportResponse>(
          '/api/v1/plogging/main-report'
        );
        
        console.log('✅ [Main Report] 메인 리포트 조회 성공');
        console.log('   오늘 완주 횟수:', data.todayCount);
        console.log('   오늘 거리:', data.todayDistance, 'm');
        console.log('   오늘 시간:', data.todayTime);
        console.log('   오늘 쓰레기 수:', data.todayTrashCount);
        console.log('   탄소 감축량:', data.carbonReduction, 'kg');
        console.log('   오늘 경로 수:', data.todayRoutes?.length || 0);
        console.log('   주간 기록 수:', data.WeeklyRecords?.length || 0);
        
        return data;
      } catch (error) {
        console.error('❌ [Main Report] 메인 리포트 조회 실패:', error);
        throw error;
      }
      */
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    retry: 2, // 실패 시 2번 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });
};
