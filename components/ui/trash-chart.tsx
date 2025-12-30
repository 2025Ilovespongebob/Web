import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const leftArrowSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 18L9 12L15 6" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const rightArrowSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 18L15 12L9 6" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

interface TrashChartProps {
  data?: number[];
  labels?: string[];
}

export const TrashChart: React.FC<TrashChartProps> = ({ 
  data = [62, 70, 58, 81, 60, 59, 0],
  labels = ['24일', '25일', '26일', '27일', '28일', '29일', '30일']
}) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const screenWidth = Dimensions.get('window').width - 20;

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.Blue3,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.Border2,
      strokeWidth: 1,
    },
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: (opacity = 1) => colors.Blue3,
        strokeWidth: 2,
      },
    ],
    legend: [],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setCurrentWeek(currentWeek - 1)}
          style={styles.arrowButton}
        >
          <SvgXml xml={leftArrowSvg} width={24} height={24} />
        </TouchableOpacity>
        
        <Text style={styles.title}>주운 쓰레기 수</Text>
        
        <TouchableOpacity 
          onPress={() => setCurrentWeek(currentWeek + 1)}
          style={styles.arrowButton}
        >
          <SvgXml xml={rightArrowSvg} width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={170}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={false}
          withDots={true}
          withShadow={false}
          segments={3}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    overflow:'hidden',
    borderWidth: 1,
    borderColor: colors.Border2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrowButton: {
    padding: 4,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartContainer: {
    justifyContent:'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  chart: {
    borderRadius: 16,
  },
});
