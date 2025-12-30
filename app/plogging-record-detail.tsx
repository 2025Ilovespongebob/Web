import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/ui/nav';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { shareImage } from '../components/ui/KakaoShareWebView';

const sendSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 2L11 13" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export default function PloggingRecordDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { location, distance, duration, date, imageUrl1, imageUrl2 } = params;
  
  console.log('📸 [Detail] 받은 파라미터:', params);
  console.log('📸 [Detail] imageUrl1:', imageUrl1);
  console.log('📸 [Detail] imageUrl2:', imageUrl2);
  
  // 이미지 URL 배열 생성
  const images = [imageUrl1, imageUrl2].filter(url => {
    const isValid = url && url !== 'undefined' && url !== 'null' && url !== '';
    console.log('📸 [Detail] URL 검증:', url, '→', isValid);
    return isValid;
  });
  
  console.log('📸 [Detail] 최종 이미지 배열:', images);
  console.log('📸 [Detail] 이미지 개수:', images.length);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>플로깅 리포트 {date}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.locationText}>{'이번 플로깅에서...'}</Text>
        </View>

        {/* 이미지 섹션 */}
        <View style={styles.imagesSection}>
          {images.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContainer}
            >
              
            </ScrollView>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>현장 사진이 없습니다</Text>
            </View>
          )}
        </View>

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <View style={styles.fishContainer}>
            <Image
              source={require('../assets/han.gif')}
              style={styles.fishImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.highright}>황어 52마리를 살렸어요!</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
             <View style={styles.statBox}>
            <Text style={styles.statLabel}>이동 거리</Text>
            <Text style={styles.statValue}>1.1km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>완주 시간</Text>
            <Text style={styles.statValue}>1시간 2분</Text>
          </View>
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
  onPress={() => shareImage()}
>
  카카오톡 공유하기
</Button>
      </View>

      {/* Nav Bar */}
      <NavBar
        currentRoute="report"
        onNavigate={(route) => {
          // 모든 탭 이동은 replace로 처리 (스택 초기화)
          router.replace(`/(tabs)/${route}` as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  statsGrid:{
    gap:8
  },
  statBox:{

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
  highright:{
    marginTop: 16,
    ...typography.h3,
    fontWeight:'700',
    color:colors.Blue3,
  },
  backButton: {
    padding: 0,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontWeight:'700',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
    // height:300
  },
  mapPlaceholderText: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  section: {
    gap: 16,
  },
  locationText: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gradeText: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  imagesSection: {
    gap: 12,
  },
  imagesContainer: {
    gap: 12,
    paddingRight: 24,
  },
  imageWrapper: {
    width: 280,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.Border2,
  },
  scrapedImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.Border2,
    borderRadius: 12,
  },
  noImageText: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    gap: 8,
  },
  statLabel: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.Blue3,
  },
  rewardSection: {
    alignItems: 'center',
    gap: 16,
  },
  rewardTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
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
  footer: {
    paddingHorizontal:20,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor:colors.Yellow2,
    borderColor: colors.Yellow2,
    
  },
  shareButtonText: {

    color: "#020617",
    fontWeight: '700',
  },
});
