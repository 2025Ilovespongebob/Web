// hooks/use-tfjs-model.ts
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export interface Detection {
  bbox: number[]; // [x, y, width, height]
  class: string;
  score: number;
}

export const useTFJSModel = () => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🔄 [TFJS] 모델 로딩 시작...');
        
        // TensorFlow.js가 준비될 때까지 대기
        await tf.ready();
        console.log('✅ [TFJS] TensorFlow.js 준비 완료');
        console.log('📊 [TFJS] 백엔드:', tf.getBackend());

        // 모델 파일 로드 (3개의 shard 파일)
        // React Native에서는 require로 바이너리 파일을 직접 로드할 수 없음
        // 대신 Asset 시스템을 사용하거나 FileSystem으로 접근해야 함
        
        console.log('📦 [TFJS] 모델 파일 로드 중...');
        
        // 방법 1: Asset 시스템 사용 (권장)
        const modelJson = require('../assets/best_web_model/model.json');
        const modelWeights = [
          require('../assets/best_web_model/group1-shard1of3.bin'),
          require('../assets/best_web_model/group1-shard2of3.bin'),
          require('../assets/best_web_model/group1-shard3of3.bin'),
        ];
        
        const loadedModel = await tf.loadGraphModel(
          bundleResourceIO(modelJson, modelWeights)
        );
        
        console.log('✅ [TFJS] 모델 로드 완료');
        
        // 모델 구조 확인을 위해 테스트 추론 실행
        console.log('� [TFJJS] 모델 구조 확인 중...');
        const testInput = tf.zeros([1, 320, 320, 3]);
        const testOutput = await loadedModel.executeAsync(testInput);
        
        if (Array.isArray(testOutput)) {
          console.log('📐 [TFJS] 출력 개수:', testOutput.length);
          testOutput.forEach((output, idx) => {
            console.log(`📐 [TFJS] 출력 ${idx} 형태:`, output.shape);
            console.log(`📐 [TFJS] 출력 ${idx} dtype:`, output.dtype);
          });
          testOutput.forEach(t => t.dispose());
        } else {
          console.log('📐 [TFJS] 출력 형태:', testOutput.shape);
          console.log('📐 [TFJS] 출력 dtype:', testOutput.dtype);
          testOutput.dispose();
        }
        
        testInput.dispose();
        
        console.log('📐 [TFJS] 입력 정보:', {
          shape: loadedModel.inputs[0]?.shape,
          name: loadedModel.inputs[0]?.name,
          dtype: loadedModel.inputs[0]?.dtype,
        });
        
        setModel(loadedModel);
        setIsReady(true);
      } catch (err: any) {
        console.error('❌ [TFJS] 모델 로드 실패:', err);
        setError(err.message || '모델 로드 실패');
        setIsReady(false);
      }
    };

    loadModel();

    // Cleanup
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  const detectObjects = async (_imageBase64: string): Promise<Detection[]> => {
    if (!model || !isReady) {
      console.log('⚠️ [TFJS] 모델이 준비되지 않음');
      return [];
    }

    try {
      const startTime = Date.now();
      
      console.log('📸 [TFJS] 이미지 처리 시작...');
      console.log('⚠️ [TFJS] Expo Go 제한: 더미 입력 사용 (실제 이미지 처리 불가)');
      
      // 모델 입력 크기에 맞는 더미 텐서 생성 (320x320x3)
      const tensorStart = Date.now();
      const dummyInput = tf.randomUniform([1, 320, 320, 3], 0, 1);
      const tensorTime = Date.now() - tensorStart;
      
      console.log(`✅ [TFJS] 입력 텐서 생성 완료 (${tensorTime}ms)`);
      console.log('� [TFJS]] 입력 텐서 형태:', dummyInput.shape);
      
      // 모델 추론 (비동기)
      const inferenceStart = Date.now();
      console.log('🤖 [TFJS] AI 모델 실행 중...');
      
      const predictions = await model.executeAsync(dummyInput);
      
      const inferenceTime = Date.now() - inferenceStart;
      console.log(`✅ [TFJS] AI 모델 실행 완료 (${inferenceTime}ms)`);
      
      // 출력 확인
      if (Array.isArray(predictions)) {
        console.log('📊 [TFJS] 출력 개수:', predictions.length);
        predictions.forEach((pred, idx) => {
          console.log(`📊 [TFJS] 출력 ${idx} 형태:`, pred.shape);
        });
        
        // 첫 번째 출력 사용
        const mainOutput = predictions[0] as tf.Tensor;
        const processStart = Date.now();
        console.log('🔍 [TFJS] 출력 데이터 처리 중...');
        
        const detections = await processYOLOOutput(mainOutput);
        
        const processTime = Date.now() - processStart;
        console.log(`✅ [TFJS] 출력 처리 완료 (${processTime}ms)`);
        
        // 메모리 정리
        dummyInput.dispose();
        predictions.forEach((pred) => pred.dispose());
        
        const totalTime = Date.now() - startTime;
        console.log(`⏱️  [TFJS] 전체 처리 시간: ${totalTime}ms (텐서: ${tensorTime}ms, 추론: ${inferenceTime}ms, 처리: ${processTime}ms)`);
        
        return detections;
      } else {
        const pred = predictions as tf.Tensor;
        console.log('📊 [TFJS] 출력 형태:', pred.shape);
        
        const processStart = Date.now();
        console.log('🔍 [TFJS] 출력 데이터 처리 중...');
        
        const detections = await processYOLOOutput(pred);
        
        const processTime = Date.now() - processStart;
        console.log(`✅ [TFJS] 출력 처리 완료 (${processTime}ms)`);
        
        // 메모리 정리
        dummyInput.dispose();
        pred.dispose();
        
        const totalTime = Date.now() - startTime;
        console.log(`⏱️  [TFJS] 전체 처리 시간: ${totalTime}ms (텐서: ${tensorTime}ms, 추론: ${inferenceTime}ms, 처리: ${processTime}ms)`);
        
        return detections;
      }
    } catch (err: any) {
      console.error('❌ [TFJS] 객체 탐지 실패:', err);
      console.error('❌ [TFJS] 에러 상세:', err.message);
      return [];
    }
  };

  return {
    model,
    isReady,
    error,
    detectObjects,
  };
};

// YOLO 출력 처리 - NMS 후 출력 형태: [1, 300, 6]
async function processYOLOOutput(predictions: tf.Tensor): Promise<Detection[]> {
  const detections: Detection[] = [];
  
  try {
    const data = await predictions.data();
    const shape = predictions.shape;
    
    console.log('📊 [TFJS] 출력 형태:', shape);
    console.log('📊 [TFJS] 출력 데이터 크기:', data.length);
    
    if (!shape || shape.length === 0) {
      console.log('⚠️ [TFJS] 출력 형태가 없음');
      return detections;
    }
    
    // NMS 후 출력 형태: [batch, num_detections, 6]
    // 6개 값: [y1, x1, y2, x2, class_id, score]
    if (shape.length === 3 && shape[2] === 6) {
      const batch = shape[0];
      const numDetections = shape[1];
      const numValues = shape[2];
      
      console.log('📊 [TFJS] NMS 출력 형태: [batch, detections, values]');
      console.log('📊 [TFJS] 배치:', batch, '탐지 수:', numDetections, '값 수:', numValues);
      
      const confidenceThreshold = 0.3; // 낮춰서 더 많이 탐지
      
      for (let i = 0; i < numDetections; i++) {
        const offset = i * numValues;
        
        if (offset + 5 >= data.length) break;
        
        // NMS 출력 형태: [y1, x1, y2, x2, class_id, score]
        const y1 = data[offset];
        const x1 = data[offset + 1];
        const y2 = data[offset + 2];
        const x2 = data[offset + 3];
        // const classId = data[offset + 4];
        const score = data[offset + 5];
        
        if (score > confidenceThreshold) {
          // bbox를 [x, y, width, height] 형태로 변환
          const x = x1;
          const y = y1;
          const w = x2 - x1;
          const h = y2 - y1;
          
          detections.push({
            bbox: [x, y, w, h],
            class: 'trash',
            score: score,
          });
        }
      }
      
      console.log(`🎯 [TFJS] 탐지된 객체: ${detections.length}개`);
      
      if (detections.length > 0) {
        console.log('🎯 [TFJS] 탐지 샘플:', detections.slice(0, 5).map(d => ({
          score: d.score.toFixed(3),
          bbox: d.bbox.map(v => v.toFixed(2)),
        })));
      } else {
        console.log('ℹ️  [TFJS] 탐지 없음 (threshold: ' + confidenceThreshold + ')');
        // 데이터 샘플 확인
        console.log('📊 [TFJS] 데이터 샘플 (처음 18개):', Array.from(data.slice(0, 18)).map(v => v.toFixed(3)));
      }
    } else {
      console.log('⚠️ [TFJS] 예상치 못한 출력 형태:', shape);
      console.log('📊 [TFJS] 데이터 샘플 (처음 10개):', Array.from(data.slice(0, 10)));
    }
  } catch (err: any) {
    console.error('❌ [TFJS] 출력 처리 실패:', err.message);
  }
  
  return detections;
}
