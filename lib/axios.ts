import axios from 'axios';

// 백엔드 API URL 설정
const BACKEND_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // 개발 환경
  : 'https://your-production-api.com/api'; // 프로덕션 환경

// AI 서버 URL 설정
const AI_SERVER_BASE_URL = __DEV__
  ? 'http://localhost:5000/api' // 개발 환경
  : 'https://your-ai-server.com/api'; // 프로덕션 환경

// 백엔드 API 인스턴스
export const axiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI 서버 인스턴스
export const aiServerInstance = axios.create({
  baseURL: AI_SERVER_BASE_URL,
  timeout: 30000, // AI 처리 시간을 고려해 더 긴 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 백엔드 API 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 여기에 토큰 추가 등의 로직을 넣을 수 있습니다
    // const token = getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AI 서버 요청 인터셉터
aiServerInstance.interceptors.request.use(
  (config) => {
    // AI 서버용 인증 헤더 추가 (필요시)
    // const aiToken = getAIToken();
    // if (aiToken) {
    //   config.headers['X-AI-API-Key'] = aiToken;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 백엔드 API 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리 로직
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('Backend Response error:', error.response.status, error.response.data);
      
      // 401 Unauthorized 처리
      if (error.response.status === 401) {
        // 로그아웃 처리 또는 토큰 갱신
        console.log('Unauthorized - redirect to login');
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('Backend Request error:', error.request);
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('Backend Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// AI 서버 응답 인터셉터
aiServerInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('AI Server Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('AI Server Request error:', error.request);
    } else {
      console.error('AI Server Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
