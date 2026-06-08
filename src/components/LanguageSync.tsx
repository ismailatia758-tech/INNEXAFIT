'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/store/useLanguage';

export default function LanguageSync() {
  const { language } = useLanguage();

  useEffect(() => {
    // Sync language and direction on document root
    const root = document.documentElement;
    root.lang = language;
    if (language === 'ar') {
      root.dir = 'rtl';
      root.classList.add('rtl-layout');
      root.classList.remove('ltr-layout');
    } else {
      root.dir = 'ltr';
      root.classList.add('ltr-layout');
      root.classList.remove('rtl-layout');
    }
  }, [language]);

  return null;
}
