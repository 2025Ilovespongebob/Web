import { Tabs } from 'expo-router';
import React from 'react';

import { NavBar } from '@/components/ui/nav';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => {
        const currentRoute = state.routes[state.index].name;
        
        // Hide navbar on plogging and camera screens
        if (currentRoute === 'plogging' || currentRoute === 'camera') {
          return null;
        }
        
        return (
          <NavBar
            currentRoute={currentRoute}
            onNavigate={(route) => navigation.navigate(route)}
          />
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
        }}
      />
      <Tabs.Screen
        name="plogging"
        options={{
          title: '플로깅',
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '카메라',
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: '리포트',
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
        }}
      />
    </Tabs>
  );
}
