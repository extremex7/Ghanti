import { useIsFocused } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Pressable, Text, Vibration, View } from 'react-native';

export default function GhantiHome() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isFocused = useIsFocused(); // <-- only active when Home tab is focused

  // Play bell sound
  async function playBell() {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/bell.mp3')
    );
    soundRef.current = sound;
    await sound.playAsync();

    setTimeout(async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    }, 12000);

    Vibration.vibrate(500);
  }

  useEffect(() => {
    if (!isFocused) return; // <-- ignore if not focused

    const threshold = 1.3;
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > threshold) {
        playBell();
      }
    });

    Accelerometer.setUpdateInterval(200);

    return () => subscription.remove();
  }, [isFocused]); // <-- re-run whenever focus changes

  return (
    <View style={{ flex: 1, backgroundColor: '#0A3D91', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>🔔 Ghanti</Text>

      <Pressable
        onPress={playBell}
        style={{ backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30 }}
      >
        <Text style={{ color: '#0A3D91', fontSize: 18, fontWeight: '600' }}>Ring the Bell</Text>
      </Pressable>

      <Text style={{ color: 'white', marginTop: 10, fontSize: 14 }}>Or shake your phone!</Text>
    </View>
  );
}