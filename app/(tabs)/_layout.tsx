import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next'; // ✅ NEW IMPORT
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colorScheme } = useAppTheme();
  const { t } = useTranslation(); // ✅ NEW HOOK
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        sceneStyle: { backgroundColor: theme.background },
        tabBarStyle: {
          backgroundColor: theme.background, 
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'), // ✅ UPDATED KEY
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="candidates"
        options={{
          title: t('nav.candidates'), // ✅ UPDATED KEY
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="manifesto"
        options={{
          title: t('nav.manifesto'), // ✅ UPDATED KEY
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}