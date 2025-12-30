import { TrashChart } from '@/components/ui/trash-chart';
import { WeeklyStreak } from '@/components/ui/weekly-streak';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyScreen() {

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Trash Chart */}
        <Text style={styles.sectionTitle}>최근 7일</Text>
        <TrashChart />

        {/* Overall Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>전체 통계</Text>
          
          {/* Plogging Stats */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>플로깅</Text>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>총 이동거리</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>505km</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>총 소요시간</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>126시간</Text>
              </View>
            </View>
          </View>

          {/* Trash Stats */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>쓰레기</Text>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>발견한 쓰레기</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>총 505개</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>주운 쓰레기</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>총 468개</Text>
              </View>
            </View>
          </View>
        </View>

        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    paddingTop:12,
    ...typography.h2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // For NavBar visibility
    gap: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    gap: 4,
  },
  name: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  affiliation: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight:'700',
    color: colors.textPrimary,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.Border2,
  },
  statCardTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    gap:12,
    alignItems: 'center',
  },
  statRowLabel: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontSize: 16,
  },
  statBadge: {
    backgroundColor: colors.Gray1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statBadgeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
  },
  statsWrapper: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.Border2,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.Border2,
    width: '100%',
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.Blue3,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.Border2,
  },
  menuList: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.Border2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.Border1,
    marginHorizontal: 24,
  },
  logoutText: {
    color: colors.Red3,
  },
});
