# WebView 오류 해결 방법

## 오류 메시지
```
Invariant Violation: Tried to register two views with the same name RNCWebView
```

## 해결 방법

### 1. 개발 서버 중지
현재 실행 중인 `npm start`를 중지하세요 (Ctrl+C)

### 2. 캐시 삭제
```bash
cd sea-vision-rn

# Expo 캐시 삭제
npx expo start -c

# 또는 수동으로 캐시 삭제
rm -rf .expo
rm -rf node_modules/.cache
```

### 3. 앱 재시작
```bash
# iOS
npx expo start --ios --clear

# Android
npx expo start --android --clear

# 또는 일반 시작
npx expo start -c
```

### 4. 앱 재설치 (위 방법이 안 되면)
```bash
# 앱 삭제 후 재설치
# iOS 시뮬레이터에서 Expo Go 앱 삭제
# Android 에뮬레이터에서 Expo Go 앱 삭제

# 그리고 다시 시작
npx expo start -c
```

## 빠른 해결
터미널에서 실행:
```bash
cd sea-vision-rn
npx expo start -c
```

그리고 QR 코드를 다시 스캔하거나 시뮬레이터를 다시 시작하세요.
