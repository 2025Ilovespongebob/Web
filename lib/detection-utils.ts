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

interface Size {
  width: number;
  height: number;
}

export const scaleDetections = (
  detections: Detection[],
  originalSize: Size,
  displaySize: Size
): Detection[] => {
  console.log('🔄 [Transform] 좌표 변환 시작');
  console.log(`   └─ 원본: ${originalSize.width}x${originalSize.height}`);
  console.log(`   └─ 화면: ${displaySize.width}x${displaySize.height}`);
  
  const scaleX = displaySize.width / originalSize.width;
  const scaleY = displaySize.height / originalSize.height;
  
  console.log(`   └─ 스케일: X=${scaleX.toFixed(3)}, Y=${scaleY.toFixed(3)}`);
  
  const scaled = detections.map((det, idx) => {
    const original = det.bbox;
    const scaled = {
      x1: det.bbox.x1 * scaleX,
      y1: det.bbox.y1 * scaleY,
      x2: det.bbox.x2 * scaleX,
      y2: det.bbox.y2 * scaleY,
    };
    
    console.log(
      `   └─ [${idx}] ${det.class_name}: ` +
      `[${original.x1.toFixed(0)},${original.y1.toFixed(0)}] → ` +
      `[${scaled.x1.toFixed(0)},${scaled.y1.toFixed(0)}]`
    );
    
    return {
      ...det,
      bbox: scaled
    };
  });
  
  console.log(`✅ [Transform] ${scaled.length}개 좌표 변환 완료`);
  return scaled;
};

export const getDetectionColor = (className: string): string => {
  const colorMap: Record<string, string> = {
    plastic_bottle: '#FF6B6B',
    can: '#4ECDC4',
    plastic_bag: '#FFE66D',
    paper: '#95E1D3',
    glass: '#A8E6CF',
  };
  
  return colorMap[className] || '#FF6B6B';
};
