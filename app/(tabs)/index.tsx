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
  const { data: mainReport, isLoading, error } = useMainReport();

  useEffect(() => {
    // 현재 위치 가져오기
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('위치 가져오기 실패:', error);
      }
    })();
  }, []);

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
            markers={[]}
            selectedDay={1}
            initialLocation={userLocation}
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
