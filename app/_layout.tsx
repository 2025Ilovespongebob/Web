import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreen from '@/components/splash-screen';
import { RouteProvider } from '@/contexts/route-context';
import { queryClient } from '@/lib/query-client';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  // Kakao SDK 초기화 (Dev Client에서만 동작)
  useEffect(() => {
    const initKakao = async () => {
      try {
        const { initializeKakaoSDK } = await import('@react-native-kakao/core');
        await initializeKakaoSDK('99e3fd064582ce7387fe6b1bc3eb1e9a');
      } catch (error) {
      }
    };
    
    initKakao();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouteProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="plogging-record-detail" options={{ headerShown: false }} />
            <Stack.Screen name="plogging-camera" options={{ headerShown: false }} />
            <Stack.Screen name="complete" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </RouteProvider>
    </QueryClientProvider>
  );
}
