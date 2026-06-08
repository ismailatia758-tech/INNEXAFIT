import { create } from 'zustand';

interface LanguageState {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
}

export const useLanguage = create<LanguageState>()(
  () => ({
    language: 'en',
    setLanguage: () => {},
    toggleLanguage: () => {},
  })
);
