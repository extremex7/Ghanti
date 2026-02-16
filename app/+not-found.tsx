import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  const { colorScheme } = useAppTheme();
  const theme = Colors[colorScheme];
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* 🔔 Branding Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f9ff' }]}>
          <Ionicons name="alert-circle" size={80} color="#F36E21" />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{t('notFound.title')}</Text>
        <Text style={[styles.message, { color: theme.text }]}>{t('notFound.message')}</Text>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>{t('notFound.button')}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ADEF', // RSP Blue
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});