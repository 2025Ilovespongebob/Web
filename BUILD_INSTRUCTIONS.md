# Development Build 만들기 (깜빡임 제거)

## 🎯 왜 필요한가?
- Expo Go는 `takePictureAsync`만 지원 → 깜빡임 발생
- Development Build는 `react-native-vision-camera` 지원 → 진짜 스트리밍, 깜빡임 0%

## 📋 사전 준비

### Android Studio 설치 (안드로이드 빌드용)
1. https://developer.android.com/studio 에서 다운로드
2. 설치 후 SDK 설정 확인

### 환경 변수 설정 (macOS)
```bash
# ~/.zshrc 또는 ~/.bash_profile에 추가
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

설정 후:
```bash
source ~/.zshrc
```

## 🚀 빌드 단계

### 1. 프로젝트 폴더로 이동
```bash
cd front
```

### 2. 네이티브 코드 생성 (Prebuild)
```bash
npx expo prebuild --clean
```

이 명령어가:
- `android/` 폴더 생성
- `ios/` 폴더 생성
- 네이티브 설정 자동 구성

### 3. 안드로이드 빌드 & 실행
```bash
npx expo run:android
```

또는 직접 빌드:
```bash
cd android
./gradlew assembleDebug
cd ..
```

### 4. 앱 설치 & 실행
- 빌드가 완료되면 자동으로 폰에 설치됨
- Metro 번들러가 자동으로 시작됨

## 🔧 문제 해결

### "SDK location not found" 에러
```bash
# android/local.properties 파일 생성
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Gradle 에러
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### 폰이 인식 안 될 때
```bash
# USB 디버깅 확인
adb devices

# 없으면 개발자 옵션 활성화 필요
```

## ✅ 성공 확인

빌드가 성공하면:
1. 폰에 "sea-vision-rn" 앱 설치됨
2. Expo Go 아님! 독립 앱임
3. 카메라 탭 열면 깜빡임 없이 부드러운 스트리밍
4. 진짜 30fps 실시간 디텍션

## 🎬 실행 방법

### 첫 빌드 후
```bash
cd front
npx expo start --dev-client
```

### 코드 수정 후
- 자동으로 Hot Reload됨
- 네이티브 코드 변경 시에만 재빌드 필요

## 📱 Expo Go vs Development Build

| 기능 | Expo Go | Development Build |
|------|---------|-------------------|
| 설치 | 앱스토어에서 다운 | 직접 빌드 필요 |
| 카메라 | takePictureAsync (깜빡임) | Vision Camera (부드러움) |
| 스트리밍 | 불가능 | 가능 (30fps) |
| 네이티브 모듈 | 제한적 | 모두 사용 가능 |

## 🔄 다시 Expo Go로 돌아가기

```bash
cd front
rm -rf android ios
```

그리고 `npx expo start`로 실행하면 다시 Expo Go 사용
