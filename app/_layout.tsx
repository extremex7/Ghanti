import { ThemeProvider } from '@/context/ThemeContext'; // ✅ 2. Use your custom Theme Provider
import '@/i18n'; // ✅ 1. Initialize translations first
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" /> 
    </ThemeProvider>
  );
}