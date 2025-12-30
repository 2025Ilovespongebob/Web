// components/KakaoShareWebView.tsx
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

// 이미지만 공유
export async function shareImage() {
  try {
    // 로컬 이미지 에셋 로드
    const asset = Asset.fromModule(require('../../assets/img.png'));
    await asset.downloadAsync();
    
    if (!asset.localUri) {
      Alert.alert('오류', '이미지를 불러올 수 없습니다.');
      return;
    }

    // 공유 가능 여부 확인
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
      return;
    }

    // 이미지 공유 (카카오톡 포함한 모든 공유 앱)
    await Sharing.shareAsync(asset.localUri, {
      mimeType: 'image/png',
      dialogTitle: '플로깅 리포트 공유하기',
      UTI: 'public.png',
    });
  } catch (error: any) {
    console.error('Share error:', error);
    Alert.alert('공유 실패', '이미지 공유에 실패했습니다. 다시 시도해주세요.');
  }
}
