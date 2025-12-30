import { Button } from '@/components/ui/button';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const sendSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 2L11 13" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export default function CompleteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>플로깅 완료!</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Congratulations Section */}
        <View style={styles.section}>
          <Text style={styles.congratsText}>수고하셨습니다!</Text>
          <Text style={styles.subText}>이번 플로깅에서...</Text>
        </View>

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <View style={styles.fishContainer}>
            <Image
              source={require('../assets/Fish.png')}
              style={styles.fishImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.highlight}>황어 52마리를 살렸어요!</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>이동 거리</Text>
            <Text style={styles.statValue}>1.1km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>완주 시간</Text>
            <Text style={styles.statValue}>1시간 2분</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>주운 쓰레기</Text>
            <Text style={styles.statValue}>62개</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>예상 탄소 절감량</Text>
            <Text style={styles.statValue}>5.05 kgCO2e</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          variant="outline"
          style={styles.shareButton}
          textStyle={styles.shareButtonText}
          leftIcon={<SvgXml xml={sendSvg} width={20} height={20} />}
          onPress={() => console.log('Share')}
        >
          카카오톡 공유하기
        </Button>
        
        <Button
          style={styles.homeButton}
          textStyle={styles.homeButtonText}
          onPress={() => router.push('/(tabs)/index' as any)}
        >
          홈으로
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.Border2,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 8,
    alignItems: 'center',
  },
  congratsText: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.Blue3,
    textAlign: 'center',
  },
  subText: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  rewardSection: {
    alignItems: 'center',
    gap: 16,
  },
  fishContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishImage: {
    width: '100%',
    height: '100%',
  },
  highlight: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.Blue3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    gap: 8,
  },
  statLabel: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.Blue3,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.Yellow2,
    borderColor: colors.Yellow2,
  },
  shareButtonText: {
    color: '#020617',
    fontWeight: '700',
  },
  homeButton: {
    flex: 1,
    backgroundColor: colors.Blue3,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});
