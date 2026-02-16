import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = _useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme || 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ colorScheme: theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};