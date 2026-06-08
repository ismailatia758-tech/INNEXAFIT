'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 backdrop-blur-sm group cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            {language === 'en' ? 'New: AI-Powered Workout Generation' : 'جديد: الذكاء الاصطناعي لتصميم الجداول'}
          </span>
          <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.9]"
        >
          {language === 'en' ? (
            <>
              Coaching <br />
              <span className="text-brand-gradient">Redefined.</span>
            </>
          ) : (
            <>
              مستقبل التدريب <br />
              <span className="text-brand-gradient">يبدأ هنا.</span>
            </>
          )}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {t.desc}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/register">
            <Button size="lg" variant="brand" className="min-w-[200px] text-lg">
              {t.ctaStart}
            </Button>
          </Link>
          <button className="flex items-center space-x-3 group px-4 py-2">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-lg">{t.ctaDemo}</span>
          </button>
        </motion.div>

        {/* Dashboard Preview Component Mock */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring' }}
          className="mt-24 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="p-2 rounded-[2.5rem] bg-secondary/30 border border-border backdrop-blur-sm">
            <div className="rounded-[2rem] overflow-hidden border border-border bg-background aspect-video shadow-2xl relative">
              {/* This would be an image or a complex mock UI */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 flex items-center justify-center">
                 <div className="text-muted-foreground/20 text-4xl font-black uppercase tracking-widest rotate-12">
                   Interactive Dashboard Preview
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
