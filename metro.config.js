// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// TensorFlow.js 모델 파일 지원을 위한 설정
config.resolver.assetExts.push(
  // TensorFlow.js 모델 파일
  'bin',
  'pb',
  'tflite',
  // 기타 바이너리 파일
  'db'
);

module.exports = config;
