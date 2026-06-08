'use client';

import { useEffect } from 'react';

export default function LanguageSync() {
  useEffect(() => {
    // Sync language and direction on document root
    const root = document.documentElement;
    root.lang = 'en';
    root.dir = 'ltr';
    root.classList.add('ltr-layout');
    root.classList.remove('rtl-layout');
  }, []);

  return null;
}
