// hooks/use-main-report.ts
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { MainReportResponse } from '@/types/main-report';

// 메인 리포트 조회
export const useMainReport = () => {
  return useQuery<MainReportResponse>({
    queryKey: ['mainReport'],
    queryFn: async () => {
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
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    retry: 2, // 실패 시 2번 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });
};
