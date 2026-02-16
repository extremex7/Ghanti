import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Countdown() {
  const { colorScheme } = useAppTheme();
  const theme = Colors[colorScheme];

  const targetDate = new Date('2026-03-05T00:00:00');

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { borderColor: theme.text + '30' }]}>
      {/* Updated Label to be specific */}
      <Text style={[styles.header, { color: theme.text }]}>COUNTDOWN TO 2084 B.S.</Text>
      
      <View style={styles.row}>
        <TimeBox value={timeLeft.days} label="DAYS" theme={theme} />
        <View style={styles.separator}><Text style={[styles.sepText, { color: theme.text }]}>:</Text></View>
        <TimeBox value={timeLeft.hours} label="HRS" theme={theme} />
        <View style={styles.separator}><Text style={[styles.sepText, { color: theme.text }]}>:</Text></View>
        <TimeBox value={timeLeft.minutes} label="MIN" theme={theme} />
        <View style={styles.separator}><Text style={[styles.sepText, { color: theme.text }]}>:</Text></View>
        <TimeBox value={timeLeft.seconds} label="SEC" theme={theme} />
      </View>
    </View>
  );
}

function TimeBox({ value, label, theme }: { value: number; label: string; theme: any }) {
  return (
    <View style={styles.box}>
      <View style={styles.numberContainer}>
        <Text style={styles.timeText}>{value < 10 ? `0${value}` : value}</Text>
      </View>
      <Text style={[styles.labelText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    width: '90%',
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 10,
    opacity: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
  },
  numberContainer: {
    backgroundColor: '#F36E21', // RSP Orange
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    marginBottom: 4,
    elevation: 2,
  },
  timeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  separator: {
    height: '100%',
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingHorizontal: 4,
  },
  sepText: {
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.5,
  },
});