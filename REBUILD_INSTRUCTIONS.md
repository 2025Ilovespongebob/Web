# New Architecture 비활성화 후 재빌드 필요

## 변경 사항
- `android/gradle.properties`: `newArchEnabled=false`
- `ios/Podfile.properties.json`: `"newArchEnabled": "false"`

## 재빌드 방법

### Android
```bash
cd front
npx expo run:android --clear
```

또는

```bash
cd front/android
./gradlew clean
cd ..
npx expo run:android
```

### iOS
```bash
cd front/ios
pod install
cd ..
npx expo run:ios
```

## 주의사항
- 기존 빌드 캐시를 완전히 삭제하고 다시 빌드해야 합니다
- Development Build를 다시 설치해야 합니다
- Metro bundler도 재시작하세요: `npx expo start --clear`

## 에러 해결
`topCameraReady` 에러는 react-native-vision-camera가 New Architecture(Fabric)와 호환되지 않아 발생했습니다.
New Architecture를 비활성화하면 해결됩니다.
