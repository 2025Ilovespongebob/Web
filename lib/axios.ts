import axios from 'axios';

// 백엔드 API URL 설정
const BACKEND_BASE_URL = __DEV__ 
  ? 'http://10.150.151.170:8080' // 개발 환경
  : 'http://10.150.151.170:8080'; // 프로덕션 환경


// AI 서버 URL 설정
const AI_SERVER_BASE_URL = __DEV__
  ? 'http://10.150.150.224:8000' // 개발 환경
  : 'http://10.150.150.224:8000'; // 프로덕션 환경

// 백엔드 API 인스턴스
export const axiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 500000, // 500초 (8분 20초)
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI 서버 인스턴스
export const aiServerInstance = axios.create({
  baseURL: AI_SERVER_BASE_URL,
  timeout: 500000, // 500초 (8분 20초)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 백엔드 API 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 [Backend API] 요청 시작');
    console.log('   URL:', (config.baseURL || '') + (config.url || ''));
    console.log('   Method:', config.method?.toUpperCase());
    console.log('   Headers:', config.headers);
    if (config.data) {
      console.log('   Body:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [Backend API] 요청 설정 실패:', error);
    return Promise.reject(error);
  }
);

// AI 서버 요청 인터셉터
aiServerInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 [AI Server] 요청 시작');
    console.log('   URL:', (config.baseURL || '') + (config.url || ''));
    console.log('   Method:', config.method?.toUpperCase());
    
    return config;
  },
  (error) => {
    console.error('❌ [AI Server] 요청 설정 실패:', error);
    return Promise.reject(error);
  }
);

// 백엔드 API 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [Backend API] 응답 성공');
    console.log('   URL:', response.config.url);
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data).substring(0, 200) + '...');
    return response;
  },
  (error) => {
    // 에러 처리 로직
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('❌ [Backend API] 응답 에러');
      console.error('   URL:', error.config?.url);
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우 (타임아웃 등)
      console.error('❌ [Backend API] 타임아웃 또는 네트워크 에러');
      console.error('   URL:', error.config?.url);
      console.error('   Timeout:', error.config?.timeout, 'ms');
      console.error('   Message:', error.message);
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('❌ [Backend API] 요청 설정 에러:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// AI 서버 응답 인터셉터
aiServerInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [AI Server] 응답 성공');
    console.log('   URL:', response.config.url);
    console.log('   Status:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ [AI Server] 응답 에러');
      console.error('   URL:', error.config?.url);
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('❌ [AI Server] 타임아웃 또는 네트워크 에러');
      console.error('   URL:', error.config?.url);
      console.error('   Timeout:', error.config?.timeout, 'ms');
      console.error('   Message:', error.message);
    } else {
      console.error('❌ [AI Server] 요청 설정 에러:', error.message);
    }
    
    return Promise.reject(error);
  }
);
