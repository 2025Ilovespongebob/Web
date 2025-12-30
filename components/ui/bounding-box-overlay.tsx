import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BoundingBox, BoundingBoxProps } from './bounding-box';

export interface Detection extends Omit<BoundingBoxProps, 'x' | 'y' | 'width' | 'height'> {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundingBoxOverlayProps {
  detections: Detection[];
  containerWidth?: number;
  containerHeight?: number;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  detections,
  containerWidth,
  containerHeight,
}) => {
  return (
    <View
  style={[
    styles.overlay,
    containerWidth != null && containerHeight != null
      ? { width: containerWidth, height: containerHeight }
      : undefined,
  ]}
>
      {detections.map((detection) => (
        <BoundingBox
          key={detection.id}
          x={detection.x}
          y={detection.y}
          width={detection.width}
          height={detection.height}
          label={detection.label}
          confidence={detection.confidence}
          color={detection.color}
          borderWidth={detection.borderWidth}
          showLabel={detection.showLabel}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none', // 터치 이벤트 통과
  },
});
