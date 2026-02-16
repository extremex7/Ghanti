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
  
  // 🛡️ REFS for instant state tracking (Prevents "Restart" bugs)
  const isPlayingRef = useRef(false); 
  const lastActionTimeRef = useRef(0);
  const playStartTimeRef = useRef(0);

  // 📊 STATE
  const [isRallying, setIsRallying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ringCount, setRingCount] = useState(0); // 🆕 Ring Counter

  // 1. Load Saved Ring Count on Startup
  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    const saved = await AsyncStorage.getItem('user-ring-count');
    if (saved) setRingCount(parseInt(saved, 10));
  };

  const incrementCount = async () => {
    const newCount = ringCount + 1;
    setRingCount(newCount);
    await AsyncStorage.setItem('user-ring-count', newCount.toString());
  };

  // 2. Language Toggle
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    AsyncStorage.setItem('user-language', newLang);
  };

  // 3. Shake Listener
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      // 🛡️ Block shakes if we just pressed a button (within 500ms)
      if (now - lastActionTimeRef.current < 500) return;

      const force = Math.abs(x) + Math.abs(y) + Math.abs(z);
      
      // Force > 3.5 for a deliberate shake
      if (force > 3.5) { 
        // 🛡️ Check the REF, not the state (React state can be slow)
        if (!isRallying && !isPlayingRef.current) {
          triggerRing();
        }
      }
    });
    
    return () => sub.remove();
  }, [isRallying]); 

  // 4. Audio Listener
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      const now = Date.now();
      
      // 🛡️ IGNORE "Finished" events if playback started < 500ms ago
      if (now - playStartTimeRef.current < 500) return;

      if (status.didJustFinish) {
        handleStopState();
      }
    });
    return () => sub.remove();
  }, [player]);

  // 5. Rally Animation Loop
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

  // ✅ CORE FUNCTIONS
  const handleStopState = () => {
    setIsPlaying(false);
    isPlayingRef.current = false; // Sync Ref
    scaleAnim.setValue(1);
  };

  const triggerRing = () => {
    const now = Date.now();
    lastActionTimeRef.current = now; // Block shakes
    playStartTimeRef.current = now;  // Block premature "finish" events

    Vibration.vibrate(100);
    setIsPlaying(true);
    isPlayingRef.current = true; // Sync Ref
    
    incrementCount(); // 🆕 Add to Count

    // Pulse Animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    player.seekTo(0);
    player.play();
  };

  const triggerStop = () => {
    lastActionTimeRef.current = Date.now(); // Block shakes
    player.pause();
    player.seekTo(0);
    handleStopState();
  };

  // 🔔 Button Handler
  const handleMainButtonPress = () => {
    if (isRallying) {
      toggleRally(); 
      return;
    }

    if (isPlayingRef.current) {
      triggerStop();
    } else {
      triggerRing();
    }
  };

  const toggleRally = () => {
    lastActionTimeRef.current = Date.now();
    if (isRallying) {
      player.pause();
      player.loop = false;
      setIsRallying(false);
      handleStopState();
    } else {
      player.loop = true;
      player.play();
      setIsRallying(true);
      setIsPlaying(true);
      isPlayingRef.current = true;
      incrementCount(); // 🆕 Count Rally start as 1 ring
    }
  };

  // UI Texts
  const getMainButtonText = () => {
    if (isRallying) return i18n.language === 'en' ? '🛑 STOP RALLY' : '🛑 रोक्नुहोस्';
    if (isPlaying) return i18n.language === 'en' ? '🛑 STOP' : '🛑 रोक्नुहोस्';
    return t('home.ringButton');
  };

  const rallyText = i18n.language === 'en' ? '📢 RALLY MODE' : '📢 र्‍याली मोड';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
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

      <View style={styles.content}>
        
        {/* BELL ICON */}
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

        {/* 🆕 CONTRIBUTION COUNTER */}
        <View style={styles.counterContainer}>
            <Text style={[styles.counterLabel, { color: theme.text }]}>{t('home.count_label')}</Text>
            <Text style={styles.counterValue}>{t('home.count_value', { count: ringCount })}</Text>
        </View>

        <Countdown />

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
    width: 200, // Slightly smaller to fit counter
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bellInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
  },
  bellImage: { width: 90, height: 90, resizeMode: 'contain' },
  
  // 🆕 Counter Styles
  counterContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    opacity: 0.6,
  },
  counterValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F36E21', 
  },

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