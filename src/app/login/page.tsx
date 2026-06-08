'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].auth;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      let user, accessToken, refreshToken;

      // 1. Check default mock users
      if (data.email === 'coach@innexafit.com' && data.password === '123456') {
        user = { id: 'mock-coach-id', email: 'coach@innexafit.com', role: 'COACH', name: 'Coach Innexa' };
        accessToken = 'mock-access-token';
        refreshToken = 'mock-refresh-token';
      } else if (data.email === 'client@innexafit.com' && data.password === '123456') {
        user = { id: 'mock-client-id', email: 'client@innexafit.com', role: 'CLIENT', name: 'John Doe' };
        accessToken = 'mock-access-token';
        refreshToken = 'mock-refresh-token';
      } else if (data.email === 'admin@innexafit.com' && data.password === '123456') {
        user = { id: 'mock-admin-id', email: 'admin@innexafit.com', role: 'ADMIN', name: 'Platform Owner' };
        accessToken = 'mock-access-token';
        refreshToken = 'mock-refresh-token';
      } else {
        // 2. Check localStorage mock users
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const foundMock = mockUsers.find((u: any) => u.email === data.email && u.password === data.password);
        
        if (foundMock) {
          user = foundMock.user;
          accessToken = foundMock.accessToken;
          refreshToken = foundMock.refreshToken;
        } else {
          // 3. Fallback to real API
          const response = await api.post('/auth/login', data);
          user = response.data.user;
          accessToken = response.data.accessToken;
          refreshToken = response.data.refreshToken;
        }
      }

      setAuth(user, accessToken, refreshToken);
      toast.success(language === 'en' ? `Welcome, ${user.name || 'User'}!` : `أهلاً يا ${user.name || 'مستخدم'}!`);
      
      // Redirect based on role
      if (user.role === 'COACH') router.push('/dashboard/coach');
      else if (user.role === 'CLIENT') router.push('/dashboard/client');
      else router.push('/dashboard/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === 'en' ? 'Failed to login' : 'فشل تسجيل الدخول'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-full text-4xl font-extrabold tracking-tight mb-4">
            <img src="/logo.png" className="h-[28px] w-auto object-contain mr-1" alt="Logo" />
            <span className="text-white">INNEXA</span>
            <span className="text-neutral-500">FIT</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">{t.welcomeBack}</h1>
          <p className="text-muted-foreground mt-2">{t.loginDesc}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.emailLabel}</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">{t.passwordLabel}</label>
            </div>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            <div className="flex justify-end mt-2">
              <Link href="/forgot-password" className="text-xs text-primary font-bold hover:underline">
                {language === 'en' ? 'Forgot password?' : 'هل نسيت كلمة المرور؟'}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (language === 'en' ? 'Logging in...' : 'جاري الدخول...') : t.loginBtn}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          {t.noAccount}{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            {language === 'en' ? 'Register Now' : 'سجل الآن'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
