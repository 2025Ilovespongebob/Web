// AI 백엔드 서버 설정
// 개발 시: 로컬 네트워크의 실제 IP 주소로 변경하세요
// 프로덕션: 실제 서버 도메인으로 변경하세요

// IP 주소 찾는 방법:
// macOS: ifconfig | grep "inet "
// Windows: ipconfig
// Linux: ip addr show

// 예시:
// - 로컬: 'ws://192.168.0.10:8000/stream/ws'
// - 프로덕션: 'wss://api.yourdomain.com/stream/ws'

export const API_CONFIG = {
  // 여기에 실제 IP 주소를 입력하세요
  AI_SERVER_HOST: '10.150.150.224',  // 👈 현재 실제 IP
  AI_SERVER_PORT: 8000,
  
  get WS_URL() {
    return `ws://${this.AI_SERVER_HOST}:${this.AI_SERVER_PORT}/stream/ws`;
  },
  
  get HTTP_URL() {
    return `http://${this.AI_SERVER_HOST}:${this.AI_SERVER_PORT}`;
  }
};

// 서버 연결 테스트 함수
export const testServerConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 [API] 서버 연결 테스트:', API_CONFIG.HTTP_URL);
    const response = await fetch(`${API_CONFIG.HTTP_URL}/`, {
      method: 'GET',
      timeout: 5000,
    } as any);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [API] 서버 연결 성공:', data);
      return true;
    } else {
      console.error('❌ [API] 서버 응답 에러:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ [API] 서버 연결 실패:', error);
    return false;
  }
};
