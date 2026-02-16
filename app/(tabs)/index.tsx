import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Countdown from '../../components/Countdown';
import { useAppTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { colorScheme, toggleTheme } = useAppTheme();
  const { t, i18n } = useTranslation(); 
  const theme = Colors[colorScheme];
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(require('../../assets/sounds/bell.mp3'));
  
  // 🆕 Ref to block shaking immediately after stopping
  const lastStopRef = useRef<number>(0); 

  const [isRallying, setIsRallying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Language Toggle
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    AsyncStorage.setItem('user-language', newLang);
  };

  // 2. Shake Listener (High Threshold + Cooldown Fix)
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.abs(x) + Math.abs(y) + Math.abs(z);
      const now = Date.now();

      // 🛑 COOLDOWN CHECK: Ignore shakes if we pressed stop < 1 second ago
      if (now - lastStopRef.current < 1000) return;
      
      // 4.0 is a good balance for "Hard Shake"
      if (force > 4.0) { 
        if (!isRallying && !isPlaying) {
          triggerRing();
        }
      }
    });
    
    return () => sub.remove();
  }, [isRallying, isPlaying]);

  // 3. Audio Listener (Auto-reset when sound ends naturaly)
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      // Only reset if it finished playing naturally (not paused/stopped by us)
      if (status.didJustFinish) {
        setIsPlaying(false);
        scaleAnim.setValue(1);
      }
    });
    return () => sub.remove();
  }, [player]);

  // 4. Rally Animation
  useEffect(() => {
    let loopAnim: Animated.CompositeAnimation;
    if (isRallying) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 250, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
    } else {
      if (!isPlaying) {
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
      }
    }
    return () => { if (loopAnim) loopAnim.stop(); };
  }, [isRallying, isPlaying]);

  // 🟢 Helper: Start Ringing
  const triggerRing = () => {
    Vibration.vibrate(100);
    setIsPlaying(true);
    
    // Pulse Animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    player.seekTo(0);
    player.play();
  };

  // 🛑 Helper: Stop Ringing
  const triggerStop = () => {
    player.pause();
    player.seekTo(0);
    setIsPlaying(false);
    scaleAnim.setValue(1);
    
    // 🆕 Set cooldown timestamp so shake listener ignores movement for 1s
    lastStopRef.current = Date.now();
  };

  // 🔔 Main Button Handler
  const handleMainButtonPress = () => {
    if (isRallying) {
      toggleRally(); // Stop Rally
      return;
    }

    if (isPlaying) {
      triggerStop(); // STOP
    } else {
      triggerRing(); // PLAY
    }
  };

  const toggleRally = () => {
    if (isRallying) {
      // STOP RALLY
      player.pause();
      player.loop = false;
      setIsRallying(false);
      setIsPlaying(false);
      lastStopRef.current = Date.now(); // Add cooldown here too
    } else {
      // START RALLY
      player.loop = true;
      player.play();
      setIsRallying(true);
      setIsPlaying(true);
    }
  };

  // 📝 Dynamic Button Text
  const getMainButtonText = () => {
    if (isRallying) return i18n.language === 'en' ? '🛑 STOP RALLY' : '🛑 रोक्नुहोस्';
    if (isPlaying) return i18n.language === 'en' ? '🛑 STOP' : '🛑 रोक्नुहोस्';
    return t('home.ringButton'); // "RING THE BELL"
  };

  const rallyText = i18n.language === 'en' ? '📢 RALLY MODE' : '📢 र्‍याली मोड';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleLanguage}>
          <Text style={{ fontSize: 22 }}>{i18n.language === 'en' ? '🇳🇵' : '🇺🇸'}</Text>
        </TouchableOpacity>
        
        <View style={styles.topSection}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>{t('home.brandTitle')}</Text>
          <Text style={[styles.missionText, { color: theme.text }]}>{t('home.mission')}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
          <Ionicons name={colorScheme === 'dark' ? "sunny" : "moon"} size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        
        {/* BELL ICON - NOW CLICKABLE TO STOP TOO */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleMainButtonPress} 
          style={[
            styles.bellOuter, 
            { 
              borderColor: (isRallying || isPlaying) ? '#F36E21' : theme.text + '4D', 
              borderWidth: (isRallying || isPlaying) ? 4 : 1 
            }
          ]}
        >
          <Animated.View style={[styles.bellInner, { transform: [{ scale: scaleAnim }] }]}>
            <Image source={require('../../assets/images/icon.png')} style={styles.bellImage} />
          </Animated.View>
        </TouchableOpacity>

        {/* COUNTDOWN */}
        <Countdown />

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          
          {/* Main Ring/Stop Button */}
          <TouchableOpacity 
            onPress={handleMainButtonPress} 
            style={[
              styles.ringButton, 
              { backgroundColor: (isPlaying || isRallying) ? '#ff4444' : '#F36E21' }
            ]}
          >
            <Text style={styles.ringButtonText}>{getMainButtonText()}</Text>
          </TouchableOpacity>

          {/* Rally Button */}
          <TouchableOpacity 
            onPress={toggleRally} 
            style={[
              styles.rallyButton, 
              { backgroundColor: isRallying ? '#333' : 'rgba(255, 255, 255, 0.2)' }
            ]}
          >
            <Text style={[styles.rallyButtonText, { color: isRallying ? 'white' : theme.text }]}>
              {rallyText}
            </Text>
          </TouchableOpacity>

        </View>
        
        <Text style={[styles.shakeHint, { color: theme.text }]}>{t('home.shakeHint')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    paddingBottom: 20 
  },
  topSection: { alignItems: 'center', flex: 1 },
  brandTitle: { fontSize: 24, fontWeight: '900', marginBottom: 5, textAlign: 'center' },
  missionText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 4, opacity: 0.9 },
  bellOuter: {
    width: 220, 
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bellInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
  },
  bellImage: { width: 100, height: 100, resizeMode: 'contain' },
  buttonContainer: { width: '100%', alignItems: 'center', gap: 12 },
  ringButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 40,
    elevation: 5,
    minWidth: 250,
    alignItems: 'center'
  },
  ringButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  rallyButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 200,
    alignItems: 'center'
  },
  rallyButtonText: { fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  shakeHint: { opacity: 0.7, fontSize: 14, fontWeight: '500' },
});