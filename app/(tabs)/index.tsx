import { Button } from '@/components/ui/button';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import KakaoMapView from '../../components/kakao-map-view';
import { TodayCard } from '../../components/ui/today-card';
import { WeeklyStreak } from '../../components/ui/weekly-streak';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export default function HomeScreen() {
  const navigation = useNavigation();

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
            state="Success"
            title="1회 완주"
            metric1="거리 2.4km"
            metric2="2시간 소요"
            onPress={() => navigation.navigate('report' as never)}
          />
        </View>
        <Button textStyle={{ fontWeight: '700' }} onPress={() => navigation.navigate('plogging' as never)}>플로깅 시작하기</Button>
      </View>

      <View style={styles.today}>
        <Text style={styles.sectionTitle}>이번주 기록</Text>
        <WeeklyStreak />
      </View>

      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>내 주변 스팟</Text>
        <View style={styles.mapContainer}>
          <KakaoMapView
            markers={[]} // No markers for now
            selectedDay={1}
          // Ensure map takes up space
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
