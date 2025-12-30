// components/KakaoShareWebView.tsx
import * as Linking from 'expo-linking';

type KakaoShareProps = {
  title: string;
  description: string;
  imageUrl: string;
  webUrl: string;
};

export function shareToKakao({
  title,
  description,
  imageUrl,
  webUrl,
}: KakaoShareProps) {
  const kakaoJsKey = 'eee93c472709b2e00c96b5bc6e935d4c';

  const kakaoShareUrl =
    `https://share.kakao.com/?appkey=${kakaoJsKey}` +
    `&template_args=` +
    encodeURIComponent(
      JSON.stringify({
        title,
        description,
        imageUrl,
        link: {
          web_url: webUrl,
          mobile_web_url: webUrl,
        },
      })
    );

  Linking.openURL(kakaoShareUrl);
}