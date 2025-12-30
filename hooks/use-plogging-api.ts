import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

// 타입 정의
export interface PloggingRecord {
  id: string;
  date: string;
  location: string;
  distance: string;
  duration: string;
  trashCount: number;
  carbonReduction: number;
}

export interface PloggingStats {
  totalDistance: number;
  totalTime: number;
  totalTrash: number;
  weeklyTrash: number[];
}

// API 함수들
const ploggingApi = {
  // 줍깅 기록 목록 조회
  getRecords: async (): Promise<PloggingRecord[]> => {
    const { data } = await axiosInstance.get('/plogging/records');
    return data;
  },

  // 줍깅 기록 상세 조회
  getRecordById: async (id: string): Promise<PloggingRecord> => {
    const { data } = await axiosInstance.get(`/plogging/records/${id}`);
    return data;
  },

  // 줍깅 통계 조회
  getStats: async (): Promise<PloggingStats> => {
    const { data } = await axiosInstance.get('/plogging/stats');
    return data;
  },

  // 줍깅 기록 생성
  createRecord: async (record: Omit<PloggingRecord, 'id'>): Promise<PloggingRecord> => {
    const { data } = await axiosInstance.post('/plogging/records', record);
    return data;
  },

  // 줍깅 기록 삭제
  deleteRecord: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/plogging/records/${id}`);
  },
};

// React Query Hooks

// 줍깅 기록 목록 조회
export const usePloggingRecords = () => {
  return useQuery({
    queryKey: ['plogging', 'records'],
    queryFn: ploggingApi.getRecords,
  });
};

// 줍깅 기록 상세 조회
export const usePloggingRecord = (id: string) => {
  return useQuery({
    queryKey: ['plogging', 'record', id],
    queryFn: () => ploggingApi.getRecordById(id),
    enabled: !!id,
  });
};

// 줍깅 통계 조회
export const usePloggingStats = () => {
  return useQuery({
    queryKey: ['plogging', 'stats'],
    queryFn: ploggingApi.getStats,
  });
};

// 줍깅 기록 생성
export const useCreatePloggingRecord = () => {
  return useMutation({
    mutationFn: ploggingApi.createRecord,
    onSuccess: () => {
      // 성공 시 기록 목록 다시 불러오기
      // queryClient.invalidateQueries({ queryKey: ['plogging', 'records'] });
    },
  });
};

// 줍깅 기록 삭제
export const useDeletePloggingRecord = () => {
  return useMutation({
    mutationFn: ploggingApi.deleteRecord,
    onSuccess: () => {
      // 성공 시 기록 목록 다시 불러오기
      // queryClient.invalidateQueries({ queryKey: ['plogging', 'records'] });
    },
  });
};
