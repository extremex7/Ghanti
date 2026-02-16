import { Translations } from '@/constants/Translations';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type Language = 'en' | 'ne';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: typeof Translations.en; // Helper to get the current text
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default to English

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: Translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};