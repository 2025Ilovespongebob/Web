import { Calendar } from '@/components/ui/calendar';
import { PloggingRecordCard } from '@/components/ui/plogging-record-card';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMainReport } from '@/hooks/use-main-report';
import { usePloggingStore } from '@/stores/plogging-store';

export default function ReportScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: mainReport, isLoading, error } = useMainReport();
  const { generatedRoutes } = usePloggingStore(); // Zustand에서 경로 데이터 가져오기

  useEffect(() => {
    console.log('📋 [Report Screen] 화면 마운트');
    console.log('💾 [Report Screen] 저장된 경로 데이터:', generatedRoutes.length, '개');
  }, []);

  useEffect(() => {
    if (mainReport) {
      console.log('📋 [Report Screen] 메인 리포트 데이터 업데이트됨');
      console.log('   오늘 경로 수:', mainReport.todayRoutes?.length || 0);
      if (mainReport.todayRoutes && mainReport.todayRoutes.length > 0) {
        mainReport.todayRoutes.forEach((route, index) => {
          console.log(`   경로 ${index + 1}:`, route.destinationName, `(등급 ${route.trashGrade})`);
          console.log(`      imageUrl1:`, route.imageUrl1);
          console.log(`      imageUrl2:`, route.imageUrl2);
        });
      }
    }
  }, [mainReport]);

  useEffect(() => {
    if (error) {
      console.error('❌ [Report Screen] 메인 리포트 조회 에러:', error);
    }
  }, [error]);

  // Mock data for marked dates (dates with activity)
  const markedDates = [
    '2024-12-16', '2024-12-17', '2024-12-23', '2024-12-31'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>플로깅 리포트</Text>
      </View>

      {/* Calendar */}
      <Calendar
        markedDates={markedDates}
        onDateSelect={(date) => setSelectedDate(date)}
      />

      {/* History List */}
      <View style={styles.activityList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.Blue3} />
            <Text style={styles.loadingText}>경로 목록을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>경로 목록을 불러올 수 없습니다.</Text>
          </View>
        ) : mainReport && mainReport.todayRoutes && mainReport.todayRoutes.length > 0 ? (
          <>
            {console.log('📋 [Report Screen] 경로 카드 렌더링:', mainReport.todayRoutes.length, '개')}
            {mainReport.todayRoutes.map((route, index) => (
              <PloggingRecordCard
                key={`${route.sequenceOrder}-${index}`}
                location={route.destinationName}
                distance={route.description || '정보 없음'}
                duration={`등급 ${route.trashGrade}`}
                onPressDetail={() => {
                  console.log('📋 [Report Screen] 경로 카드 클릭:', route.destinationName);
                  console.log('   이미지 URL1:', route.imageUrl1);
                  console.log('   이미지 URL2:', route.imageUrl2);
                  
                  // Zustand에서 해당 경로의 scrapedImages 찾기
                  const matchedRoute = generatedRoutes.find(
                    r => r.destination_name === route.destinationName
                  );
                  
                  const images = matchedRoute?.scrapedImages || [];
                  console.log('   📸 scrapedImages:', images);
                  
                  router.push({
                    pathname: '/plogging-record-detail',
                    params: {
                      location: route.destinationName,
                      distance: route.description || '정보 없음',
                      duration: `등급 ${route.trashGrade}`,
                      date: new Date().toISOString().split('T')[0],
                      imageUrl1: images[0] || route.imageUrl1 || '',
                      imageUrl2: images[1] || route.imageUrl2 || '',
                    },
                  });
                }}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>오늘 완주한 경로가 없습니다.</Text>
            <Text style={styles.emptySubText}>플로깅을 시작해보세요!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Light gray background for contrast
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    paddingTop:16,
    ...typography.h2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.Border2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...typography.smallMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
  },
  statUnit: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 2,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activityList: {
    gap: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.bodyRegular,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
