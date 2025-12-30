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
        const { data } = await axiosInstance.get<MainReportResponse>(
          '/api/v1/plogging/main-report'
        );
        return data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
