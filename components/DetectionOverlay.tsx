import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect, Text, G } from 'react-native-svg';
import { getDetectionColor } from '@/lib/detection-utils';

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface DetectionOverlayProps {
  detections: Detection[];
  width: number;
  height: number;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  width,
  height
}) => {
  return (
    <Svg style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {detections.map((det, idx) => {
        const color = getDetectionColor(det.class_name);
        const boxWidth = det.bbox.x2 - det.bbox.x1;
        const boxHeight = det.bbox.y2 - det.bbox.y1;
        const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
        
        return (
          <G key={idx}>
            {/* 바운딩 박스 */}
            <Rect
              x={det.bbox.x1}
              y={det.bbox.y1}
              width={boxWidth}
              height={boxHeight}
              stroke={color}
              strokeWidth="3"
              fill="transparent"
            />
            
            {/* 라벨 배경 */}
            <Rect
              x={det.bbox.x1}
              y={det.bbox.y1 - 25}
              width={label.length * 8 + 10}
              height={25}
              fill={color}
              opacity={0.8}
            />
            
            {/* 라벨 텍스트 */}
            <Text
              x={det.bbox.x1 + 5}
              y={det.bbox.y1 - 8}
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              {label}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
};

const styles = StyleSheet.create({});
