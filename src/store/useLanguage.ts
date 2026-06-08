import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ar' : 'en' })),
    }),
    {
      name: 'language-storage',
    }
  )
);
