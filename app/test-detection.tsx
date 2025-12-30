import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, StatusBar } from 'react-native';
import { API_CONFIG, testServerConnection } from '@/config/api';

export default function TestDetectionScreen() {
  const [serverStatus, setServerStatus] = useState<string>('확인 중...');
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    console.log('🔍 [Test] 서버 연결 테스트 시작');
    setServerStatus('확인 중...');
    
    try {
      const reachable = await testServerConnection();
      setServerReachable(reachable);
      
      if (reachable) {
        setServerStatus('✅ 서버 연결 성공!');
        console.log('✅ [Test] 서버 연결 성공');
      } else {
        setServerStatus('❌ 서버 연결 실패');
        console.log('❌ [Test] 서버 연결 실패');
      }
    } catch (error) {
      setServerStatus('❌ 에러 발생: ' + error);
      console.error('❌ [Test] 에러:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>🧪 연결 테스트</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.label}>서버 주소:</Text>
          <Text style={styles.value}>{API_CONFIG.HTTP_URL}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>WebSocket:</Text>
          <Text style={styles.value}>{API_CONFIG.WS_URL}</Text>
        </View>

        <View style={[
          styles.statusBox,
          { backgroundColor: serverReachable ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 107, 107, 0.2)' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: serverReachable ? '#4ECDC4' : '#FF6B6B' }
          ]}>
            {serverStatus}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={checkServer}>
          <Text style={styles.buttonText}>🔄 다시 테스트</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📋 체크리스트:</Text>
          <Text style={styles.instructionText}>1. AI 서버가 실행 중인가요?</Text>
          <Text style={styles.instructionText}>2. 같은 Wi-Fi에 연결되어 있나요?</Text>
          <Text style={styles.instructionText}>3. IP 주소가 맞나요?</Text>
          <Text style={styles.instructionText}>4. 방화벽이 8000 포트를 허용하나요?</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
  },
  statusBox: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
});
