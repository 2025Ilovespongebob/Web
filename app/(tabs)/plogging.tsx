import SimpleRouteMap from '@/components/simple-route-map';
import { colors } from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { usePloggingStore } from '../../stores/plogging-store';
import { useGenerateCourse, convertRoutesToLocations } from '../../hooks/use-generate-course';
import * as Location from 'expo-location';

const leftArrowSvg = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M5.22678 8.60179C5.17441 8.65404 5.13284 8.71611 5.10449 8.78445C5.07614 8.85279 5.06152 8.92605 5.06152 9.00004C5.06152 9.07403 5.07614 9.14729 5.10449 9.21563C5.13284 9.28396 5.17441 9.34604 5.22678 9.39829L11.9768 16.1483C12.0824 16.2539 12.2257 16.3132 12.375 16.3132C12.5244 16.3132 12.6677 16.2539 12.7733 16.1483C12.8789 16.0427 12.9382 15.8994 12.9382 15.75C12.9382 15.6007 12.8789 15.4574 12.7733 15.3518L6.42041 9.00004L12.7733 2.64829C12.8789 2.54267 12.9382 2.39941 12.9382 2.25004C12.9382 2.10067 12.8789 1.95741 12.7733 1.85179C12.6677 1.74617 12.5244 1.68683 12.375 1.68683C12.2257 1.68683 12.0824 1.74617 11.9768 1.85179L5.22678 8.60179Z"
    fill="#000000"
    stroke="#000000"
  />
</svg>
`;

export default function PloggingScreen() {
  const navigation = useNavigation();
  const { isNavigating, setGeneratedRoutes } = usePloggingStore();
  const { mutate: generateCourse, isPending } = useGenerateCourse();
  const [locations, setLocations] = useState<Array<{ lat: number; lng: number; name: string; grade: 0 | 1 | 2 | 3 }>>([]);

  useEffect(() => {
    // 컴포넌트 마운트 시 현재 위치 가져와서 API 호출
    const fetchCourse = async () => {
      try {
        console.log('🔍 [Plogging] 위치 권한 요청 중...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('권한 필요', '위치 권한이 필요합니다.');
          return;
        }

        console.log('📍 [Plogging] 현재 위치 가져오는 중...');
        const currentPos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const latitude = currentPos.coords.latitude;
        const longitude = currentPos.coords.longitude;

        console.log('🚀 [Plogging] API 호출 시작:', { latitude, longitude });

        generateCourse(
          { latitude, longitude },
          {
            onSuccess: (data) => {
              console.log('✅ [Plogging] 경로 생성 성공:', data);
              
              // Zustand에 경로 데이터 저장
              setGeneratedRoutes(data.routes);
              console.log('💾 [Plogging] 경로 데이터 저장 완료:', data.routes.length, '개');
              
              // 경로 데이터를 지도용 위치 데이터로 변환
              const convertedLocations = convertRoutesToLocations(data.routes);
              console.log('📍 [Plogging] 변환된 위치 데이터:', convertedLocations);
              
              setLocations(convertedLocations);
            },
            onError: (error) => {
              console.error('❌ [Plogging] 경로 생성 실패:', error);
              Alert.alert('오류', '경로를 생성할 수 없습니다. 다시 시도해주세요.');
            },
          }
        );
      } catch (error) {
        console.error('❌ [Plogging] 위치 가져오기 실패:', error);
        Alert.alert('오류', '위치를 가져올 수 없습니다.');
      }
    };

    fetchCourse();
  }, []);

  // 로딩 중이거나 위치 데이터가 없을 때
  if (isPending || locations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.Blue3} />
          <Text style={styles.loadingText}>경로를 생성하는 중...</Text>
        </View>
        
        {/* Back Button */}
        {!isNavigating && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <SvgXml xml={leftArrowSvg} width={18} height={18} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SimpleRouteMap locations={locations} />

      {/* Back Button */}
      {!isNavigating && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <SvgXml xml={leftArrowSvg} width={18} height={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
});
