import { Calendar } from '@/components/ui/calendar';
import { PloggingRecordCard } from '@/components/ui/plogging-record-card';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReportScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Mock data for marked dates (dates with activity)
  const markedDates = [
    '2024-12-15', '2024-12-16', '2024-12-18', '2024-12-20'
  ];

  // Mock data for activities
  const activities = [
    { id: 1, title: '광안리 해수욕장 코스', dist: '2.4km', time: '50분', date: '2024-12-30' },
    { id: 2, title: '해운대 달맞이길 코스', dist: '3.1km', time: '1시간 10분', date: '2024-12-20' },
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
          {activities.map((activity) => (
            <PloggingRecordCard
              key={activity.id}
              location={activity.title}
              distance={activity.dist}
              duration={activity.time}
              onPressDetail={() => {
                router.push({
                  pathname: '/plogging-record-detail',
                  params: {
                    location: activity.title,
                    distance: activity.dist,
                    duration: activity.time,
                    date: activity.date,
                  },
                });
              }}
            />
          ))}
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
});
