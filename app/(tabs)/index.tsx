import { Button } from '@/components/ui/button';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import KakaoMapView from '../../components/kakao-map-view';
import { TodayCard, TodayCardState } from '../../components/ui/today-card';
import { WeeklyStreak } from '../../components/ui/weekly-streak';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { useMainReport } from '@/hooks/use-main-report';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { data: mainReport, isLoading } = useMainReport();

  useEffect(() => {
    console.log('🏠 [Home Screen] 화면 마운트');
    
    // 현재 위치 가져오기
    (async () => {
      try {
        console.log('📍 [Home Screen] 위치 권한 요청 중...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          console.log('✅ [Home Screen] 위치 권한 승인됨');
          const location = await Location.getCurrentPositionAsync({});
          const userLoc = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          console.log('📍 [Home Screen] 현재 위치:', userLoc);
          setUserLocation(userLoc);
        } else {
          console.warn('⚠️ [Home Screen] 위치 권한 거부됨');
        }
      } catch (error) {
        console.error('❌ [Home Screen] 위치 가져오기 실패:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (mainReport) {
      console.log('📊 [Home Screen] 메인 리포트 데이터 업데이트됨');
      console.log('   오늘 완주:', mainReport.todayCount, '회');
      console.log('   오늘 거리:', mainReport.todayDistance, 'm');
    }
  }, [mainReport]);

  // 거리를 km로 변환 (미터 단위로 받음)
  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // 시간 포맷팅 (HH:MM:SS -> X시간 Y분)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const m = parseInt(minutes);
    
    if (h === 0) return `${m}분`;
    if (m === 0) return `${h}시간`;
    return `${h}시간 ${m}분`;
  };

  // TodayCard 상태 결정
  const getTodayCardState = (): TodayCardState => {
    if (!mainReport) return 'Inactive';
    if (mainReport.todayCount === 0) return 'Inactive';
    return 'Success';
  };

  // TodayCard 제목
  const getTodayCardTitle = () => {
    if (!mainReport || mainReport.todayCount === 0) return "오늘은 아직 완주하지\n 못했어요.";
    return `${mainReport.todayCount}회 완주`;
  };

  // TodayCard 메트릭
  const getTodayCardMetrics = () => {
    if (!mainReport || mainReport.todayCount === 0) {
      return { metric1: '', metric2: '' };
    }
    return {
      metric1: `거리 ${formatDistance(mainReport.todayDistance)}`,
      metric2: `${formatTime(mainReport.todayTime)} 소요`,
    };
  };

  if (isLoading) {
    console.log('⏳ [Home Screen] 메인 리포트 로딩 중...');
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.Blue3} />
      </View>
    );
  }

  const { metric1, metric2 } = getTodayCardMetrics();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>환영합니다.</Text>
      </View>

      <View style={styles.today}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 플로깅</Text>
        </View>
        <View style={styles.section}>
          <TodayCard
            state={getTodayCardState()}
            title={getTodayCardTitle()}
            metric1={metric1}
            metric2={metric2}
            onPress={() => navigation.navigate('report' as never)}
          />
        </View>
        <Button textStyle={{ fontWeight: '700' }} onPress={() => navigation.navigate('plogging' as never)}>플로깅 시작하기</Button>
      </View>

      <View style={styles.today}>
        <Text style={styles.sectionTitle}>이번주 기록</Text>
        <WeeklyStreak weeklyRecords={mainReport?.WeeklyRecords || []} />
      </View>

      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>내 주변 스팟</Text>
        <View style={styles.mapContainer}>
          <KakaoMapView
            markers={[
              {
                id: 1,
                lat: 35.1891808,
                lng: 128.9034187,
                name: '내 위치',
                day: 1,
                category: 1,
                isUserPosition: true
              },
              {
                id: 2,
                lat: 35.1859741,
                lng: 128.9029654,
                grade: 1 as 1 | 2 | 3,
                name: '쓰레기 밀집 예상 지역',
                day: 1,
                category: 1
              }
            ]}
            selectedDay={1}
            initialLocation={{ lat: 35.1891808, lng: 128.9034187 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  today: {
    gap: 12
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  header: {
    marginTop: 20,
  },
  welcomeText: {
    marginTop:24,
    ...typography.h3,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  section: {
    gap: 2,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  mapSection: {
    flex: 1,
    gap: 12,
    maxHeight: 100, // Ensure visible height for map
  },
  mapContainer: {
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.Border2,
  },
});
