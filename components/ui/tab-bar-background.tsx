// This is a shim for web and Android where the blur effect is not supported.
import { View } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent white
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}