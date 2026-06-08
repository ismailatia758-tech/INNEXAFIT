'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const t = translations[language].nav;

  const navLinks = [
    { label: t.features, href: '#features' },
    { label: t.pricing, href: '#pricing' },
    { label: t.faq, href: '#faq' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-border py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link href="/" className="flex items-center text-3xl font-extrabold tracking-tight">
            <img src="/logo.png" className="h-[24px] w-auto object-contain mr-1" alt="Logo" />
            <span className="text-white">INNEXA</span>
            <span className="text-neutral-500">FIT</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">{t.login}</Button>
          </Link>
          <Link href="/register">
            <Button variant="brand">{t.startFree}</Button>
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold font-black"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              <div className="flex flex-col space-y-4">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">{t.login}</Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button variant="brand" className="w-full">{t.startFree}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
