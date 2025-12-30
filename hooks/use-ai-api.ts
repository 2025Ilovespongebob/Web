import { useMutation } from '@tanstack/react-query';
import { aiServerInstance } from '@/lib/axios';

// 타입 정의
export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  class_name: string;
  confidence: number;
}

export interface DetectionResponse {
  detections: DetectionBox[];
  inference_time: number;
  image_size: {
    width: number;
    height: number;
  };
}

export interface StreamFrameRequest {
  image: string; // Base64 encoded image
  timestamp?: number;
}

// AI API 함수들
const aiApi = {
  // 이미지에서 쓰레기 감지
  detectTrash: async (imageBase64: string): Promise<DetectionResponse> => {
    const { data } = await aiServerInstance.post('/detect', {
      image: imageBase64,
    });
    return data;
  },

  // 스트리밍 프레임 처리
  processStreamFrame: async (request: StreamFrameRequest): Promise<DetectionResponse> => {
    const { data } = await aiServerInstance.post('/stream/detect', request);
    return data;
  },

  // 배치 이미지 처리
  detectTrashBatch: async (images: string[]): Promise<DetectionResponse[]> => {
    const { data } = await aiServerInstance.post('/detect/batch', {
      images,
    });
    return data;
  },

  // AI 서버 헬스 체크
  healthCheck: async (): Promise<{ status: string; version: string }> => {
    const { data } = await aiServerInstance.get('/health');
    return data;
  },
};

// React Query Hooks

// 쓰레기 감지 (단일 이미지)
export const useDetectTrash = () => {
  return useMutation({
    mutationFn: aiApi.detectTrash,
    onError: (error) => {
      console.error('Detection error:', error);
    },
  });
};

// 스트리밍 프레임 처리
export const useProcessStreamFrame = () => {
  return useMutation({
    mutationFn: aiApi.processStreamFrame,
    onError: (error) => {
      console.error('Stream processing error:', error);
    },
  });
};

// 배치 이미지 처리
export const useDetectTrashBatch = () => {
  return useMutation({
    mutationFn: aiApi.detectTrashBatch,
    onError: (error) => {
      console.error('Batch detection error:', error);
    },
  });
};

// AI 서버 헬스 체크
export const useAIHealthCheck = () => {
  return useMutation({
    mutationFn: aiApi.healthCheck,
  });
};

// 유틸리티 함수들

// 이미지를 Base64로 변환
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // "data:image/jpeg;base64," 부분 제거
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image to base64 conversion error:', error);
    throw error;
  }
};

// 정규화된 좌표를 픽셀 좌표로 변환
export const normalizedToPixel = (
  normalized: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
) => {
  return {
    x: normalized.x * imageWidth,
    y: normalized.y * imageHeight,
    width: normalized.width * imageWidth,
    height: normalized.height * imageHeight,
  };
};

// 픽셀 좌표를 정규화된 좌표로 변환
export const pixelToNormalized = (
  pixel: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
) => {
  return {
    x: pixel.x / imageWidth,
    y: pixel.y / imageHeight,
    width: pixel.width / imageWidth,
    height: pixel.height / imageHeight,
  };
};
