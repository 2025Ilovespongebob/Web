import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BoundingBoxProps {
  x: number; // 좌측 상단 x 좌표 (픽셀 또는 퍼센트)
  y: number; // 좌측 상단 y 좌표 (픽셀 또는 퍼센트)
  width: number; // 박스 너비
  height: number; // 박스 높이
  label?: string; // 라벨 텍스트 (기본값: "쓰레기")
  confidence?: number; // 신뢰도 (0-1)
  color?: string; // 박스 색상 (기본값: 빨간색)
  borderWidth?: number; // 테두리 두께 (기본값: 3)
  showLabel?: boolean; // 라벨 표시 여부 (기본값: true)
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({
  x,
  y,
  width,
  height,
  label = '쓰레기',
  confidence,
  color = '#FF3B30',
  borderWidth = 3,
  showLabel = true,
}) => {
  const displayLabel = confidence 
    ? `${label} ${(confidence * 100).toFixed(0)}%`
    : label;

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width,
          height,
          borderColor: color,
          borderWidth,
        },
      ]}
    >
      {showLabel && (
        <View style={[styles.labelContainer, { backgroundColor: color }]}>
          <Text style={styles.labelText}>{displayLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: -3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
