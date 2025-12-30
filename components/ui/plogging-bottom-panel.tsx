import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Button } from './button';
import { GradeTag } from './grade-tag';
import { usePloggingStore } from '../../stores/plogging-store';

const bottomArrowSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3097 18.9348C16.2691 18.9755 16.2208 19.0078 16.1677 19.0299C16.1145 19.0519 16.0575 19.0633 16 19.0633C15.9425 19.0633 15.8855 19.0519 15.8323 19.0299C15.7792 19.0078 15.7309 18.9755 15.6902 18.9348L10.4402 13.6848C10.3581 13.6026 10.3119 13.4912 10.3119 13.375C10.3119 13.2588 10.3581 13.1474 10.4402 13.0653C10.5224 12.9831 10.6338 12.937 10.75 12.937C10.8662 12.937 10.9776 12.9831 11.0597 13.0653L16 18.0064L20.9402 13.0653C21.0224 12.9831 21.1338 12.937 21.25 12.937C21.3662 12.937 21.4776 12.9831 21.5597 13.0653C21.6419 13.1474 21.688 13.2588 21.688 13.375C21.688 13.4912 21.6419 13.6026 21.5597 13.6848L16.3097 18.9348Z" fill="black" stroke="#0F172A"/>
</svg>
`;

interface PloggingBottomPanelProps {
  onStartStop?: () => void;
  onComplete?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PloggingBottomPanel: React.FC<PloggingBottomPanelProps> = ({
  onStartStop,
  onComplete,
  collapsed = false,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const {
    isNavigating,
    completionPercentage,
    routeInfo,
    routeName,
    gradeLocations,
  } = usePloggingStore();

  console.log('Bottom Panel - gradeLocations:', gradeLocations);

  const panelTranslateY = useRef(new Animated.Value(0)).current;

  const togglePanel = () => {
    const toValue = collapsed ? 0 : 0.8;

    Animated.timing(panelTranslateY, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onToggleCollapse?.();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    router.push('/complete');
  };

  return (
    <Animated.View
      style={[
        styles.bottomPanel,
        {
          transform: [
            {
              translateY: panelTranslateY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 260],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.panelContent}>
        <TouchableOpacity style={styles.headerRow} onPress={togglePanel} activeOpacity={0.7}>
          {isNavigating ? (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                <Text style={{ color: colors.Blue3 }}>{completionPercentage}%</Text> 완주했어요!
              </Text>
            </View>
          ) : (
            <Text style={styles.title}>{routeName}</Text>
          )}
          <Animated.View
            style={{
              transform: [
                {
                  rotate: panelTranslateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '222deg'],
                  }),
                },
              ],
            }}
          >
            <SvgXml xml={bottomArrowSvg} width={32} height={32} />
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.stateColumn}>
          {routeInfo && (
            <>
              <Text style={styles.statText}>거리 {(routeInfo.distance / 1000).toFixed(1)}km</Text>
              <Text style={styles.statText}>{Math.round(routeInfo.duration / 60)}분 소요</Text>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <Text style={styles.statText}>경로 내:</Text>
            {gradeLocations && gradeLocations.length > 0 ? (
              gradeLocations.map((location, index) => (
                <GradeTag key={index} grade={String(location.grade) as '1' | '2' | '3'} />
              ))
            ) : (
              <Text style={styles.statText}>등급 정보 없음</Text>
            )}
          </View>
        </View>
        <Button
          onPress={isNavigating ? onStartStop : onStartStop}
          style={isNavigating ? styles.stopButton : styles.startButton}
          textStyle={{
            color: isNavigating ? colors.textPrimary : colors.background,
            fontWeight: '700',
          }}
        >
          {isNavigating ? '그만두기' : '플로깅 시작하기'}
        </Button>
        
        {isNavigating && (
          <Button
            onPress={handleComplete}
            style={styles.completeButton}
            textStyle={{
              color: colors.background,
              fontWeight: '700',
            }}
          >
            완료하기 (임시)
          </Button>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  panelContent: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressText: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stateColumn: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 8,
  },
  startButton: {
    width: '100%',
  },
  stopButton: {
    width: '100%',
    backgroundColor: colors.Gray2,
    color: colors.textPrimary,
  },
  completeButton: {
    width: '100%',
    backgroundColor: colors.Blue3,
  },
});
