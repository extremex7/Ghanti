import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your JSON files
import en from './locales/en.json';
import ne from './locales/ne.json';

const RESOURCES = {
  en: { translation: en },
  ne: { translation: ne },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('user-language');

  if (!savedLanguage) {
    const deviceLanguage = getLocales()[0].languageCode;
    savedLanguage = deviceLanguage === 'ne' ? 'ne' : 'en';
  }

  // eslint-disable-next-line import/no-named-as-default-member
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4', 
      resources: RESOURCES,
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, 
      }
    });
};

initI18n();

export default i18n;