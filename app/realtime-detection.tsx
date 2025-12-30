import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { DetectionCamera } from '@/components/DetectionCamera';
import { useDetectionWebSocket } from '@/hooks/useDetectionWebSocket';
import { API_CONFIG, testServerConnection } from '@/config/api';

export default function RealtimeDetectionScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);
  
  const { isConnected, frameCount, responseCount } = useDetectionWebSocket(
    isEnabled ? API_CONFIG.WS_URL : ''
  );

  // 서버 연결 테스트
  useEffect(() => {
    const checkServer = async () => {
      console.log('🔍 [Init] 서버 연결 확인 중...');
      const reachable = await testServerConnection();
      setServerReachable(reachable);
      
      if (!reachable) {
        Alert.alert(
          '서버 연결 실패',
          `AI 백엔드 서버에 연결할 수 없습니다.\n\n서버 주소: ${API_CONFIG.HTTP_URL}\n\n1. AI 서버가 실행 중인지 확인하세요\n2. config/api.ts에서 IP 주소를 확인하세요\n3. 같은 네트워크에 연결되어 있는지 확인하세요`,
          [{ text: '확인' }]
        );
      }
    };
    
    checkServer();
  }, []);

  const toggleDetection = () => {
    if (!serverReachable && !isEnabled) {
      Alert.alert(
        '서버 연결 필요',
        'AI 백엔드 서버에 연결할 수 없습니다. 서버를 실행하고 다시 시도하세요.',
        [{ text: '확인' }]
      );
      return;
    }
    
    console.log(`🔄 [UI] 디텍션 ${!isEnabled ? '활성화' : '비활성화'}`);
    setIsEnabled(!isEnabled);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {isEnabled ? (
        <DetectionCamera
          serverUrl={API_CONFIG.WS_URL}
          enabled={isEnabled}
          fps={5}
          quality={0.5}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🗑️ 실시간 쓰레기 디텍션
          </Text>
          <Text style={styles.placeholderSubtext}>
            시작 버튼을 눌러 디텍션을 활성화하세요
          </Text>
          
          {serverReachable === false && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ 서버 연결 실패</Text>
              <Text style={styles.warningSubtext}>
                {API_CONFIG.HTTP_URL}
              </Text>
              <Text style={styles.warningSubtext}>
                config/api.ts에서 IP 주소를 확인하세요
              </Text>
            </View>
          )}
          
          {serverReachable === true && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ 서버 연결됨</Text>
              <Text style={styles.successSubtext}>
                {API_CONFIG.HTTP_URL}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 상태 표시 */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ECDC4' : '#FF6B6B' }]} />
        <Text style={styles.statusText}>
          {isConnected ? '연결됨' : '연결 안됨'}
        </Text>
        {isEnabled && (
          <Text style={styles.statsText}>
            전송: {frameCount} | 응답: {responseCount}
          </Text>
        )}
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isEnabled && styles.buttonActive]}
          onPress={toggleDetection}
        >
          <Text style={styles.buttonText}>
            {isEnabled ? '⏸️ 중지' : '▶️ 시작'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginTop: 20,
    maxWidth: '90%',
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  warningSubtext: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  successBox: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    marginTop: 20,
  },
  successText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  successSubtext: {
    color: '#4ECDC4',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  statusBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 'auto',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
