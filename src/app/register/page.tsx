'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, AtSign, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/;
const usernameRegex = /^[a-z0-9_\.]+$/;

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(usernameRegex, 'Username can only contain lowercase letters, numbers, dots and underscores'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(strongPasswordRegex, 'Password must include uppercase, lowercase, number and special character'),
  gender: z.enum(['Male', 'Female'], { error: 'Please select your gender' }),
  role: z.enum(['COACH', 'CLIENT']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function PasswordStrengthBar({ password }: { password: string }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const checks = [
    { label: isAr ? '٨ أحرف على الأقل' : 'At least 8 characters', ok: password.length >= 8 },
    { label: isAr ? 'حرف كبير (A-Z)' : 'Uppercase letter (A-Z)', ok: /[A-Z]/.test(password) },
    { label: isAr ? 'حرف صغير (a-z)' : 'Lowercase letter (a-z)', ok: /[a-z]/.test(password) },
    { label: isAr ? 'رقم (0-9)' : 'Number (0-9)', ok: /\d/.test(password) },
    { label: isAr ? 'رمز خاص (!@#...)' : 'Special character (!@#...)', ok: /[@$!%*?&_\-#]/.test(password) },
  ];
  const passed = checks.filter(c => c.ok).length;
  const strength = passed === 0 ? 0 : passed <= 2 ? 1 : passed <= 3 ? 2 : passed <= 4 ? 3 : 4;
  const colors = ['bg-muted', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['', isAr ? 'ضعيف' : 'Weak', isAr ? 'مقبول' : 'Fair', isAr ? 'جيد' : 'Good', isAr ? 'قوي' : 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-border'}`} />
        ))}
        <span className={`text-[10px] font-bold ml-1 ${strength >= 4 ? 'text-emerald-500' : strength >= 3 ? 'text-yellow-400' : 'text-rose-400'}`}>
          {labels[strength]}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.ok
              ? <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={11} className="text-muted-foreground/50 flex-shrink-0" />}
            <span className={`text-[10px] ${c.ok ? 'text-emerald-400' : 'text-muted-foreground/60'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].auth;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'COACH', gender: undefined },
  });

  const selectedRole = watch('role');
  const watchPassword = watch('password') || '';

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      let user, accessToken, refreshToken;
      const platformHandle = `${data.username.toLowerCase()}@innexafit.com`;

      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        username: platformHandle,
        phone: data.phone,
        gender: data.gender,
        birthDate: '1995-01-01',
      };

      try {
        const response = await api.post('/auth/register', payload);
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      } catch (err) {
        // Fallback mockup register
        user = {
          id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email: data.email,
          role: data.role,
          name: data.fullName,
          username: platformHandle,
          phone: data.phone,
          gender: data.gender,
          birthDate: '1995-01-01',
        };
        accessToken = 'mock-access-token';
        refreshToken = 'mock-refresh-token';

        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        mockUsers.push({ email: data.email, password: data.password, user, accessToken, refreshToken });
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }

      // If COACH — register with pending/free status
      if (user.role === 'COACH') {
        const savedCoachesStr = localStorage.getItem('platformCoaches');
        const coaches = savedCoachesStr ? JSON.parse(savedCoachesStr) : [];
        const coachExists = coaches.some((c: any) => c.email.toLowerCase() === user.email.toLowerCase());

        if (!coachExists) {
          const startDateStr = new Date().toISOString().split('T')[0];
          const savedConfig = localStorage.getItem('platformConfig');
          const config = savedConfig ? JSON.parse(savedConfig) : { monthlyPrice: 49, yearlyPrice: 399 };
          const isFree = config.monthlyPrice === 0 && config.yearlyPrice === 0;

          const expiry = new Date();
          if (isFree) expiry.setFullYear(expiry.getFullYear() + 1);
          const expiryDateStr = expiry.toISOString().split('T')[0];

          const newCoach = {
            id: 'c-' + Math.random().toString(36).substr(2, 9),
            name: user.name,
            email: user.email,
            username: platformHandle,
            phone: data.phone,
            gender: data.gender,
            birthDate: '1995-01-01',
            planType: isFree ? 'Free' : 'Pending',
            pricePaid: 0,
            status: isFree ? 'Active' : 'Pending',
            startDate: startDateStr,
            expiryDate: expiryDateStr,
          };

          coaches.push(newCoach);
          localStorage.setItem('platformCoaches', JSON.stringify(coaches));

          const savedClientsStr = localStorage.getItem('platformCoachesClients');
          const coachesClients = savedClientsStr ? JSON.parse(savedClientsStr) : {};
          coachesClients[newCoach.id] = [];
          localStorage.setItem('platformCoachesClients', JSON.stringify(coachesClients));

          const savedLogsStr = localStorage.getItem('platformAuditLogs');
          const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
          const newLog = {
            id: 'log-' + Math.random().toString(36).substr(2, 9),
            action: `Coach ${newCoach.name} (${platformHandle}) registered — Status: ${newCoach.status}`,
            timestamp: new Date().toISOString(),
            type: isFree ? 'success' : 'info',
          };
          localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));
        }
      }

      setAuth(user, accessToken, refreshToken);
      toast.success(language === 'en' ? `Welcome, ${user.name || 'User'}!` : `أهلاً يا ${user.name || 'مستخدم'}!`);

      if (user.role === 'COACH') router.push('/dashboard/coach');
      else router.push('/dashboard/client');
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === 'en' ? 'Failed to register' : 'فشل إنشاء الحساب'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-card border border-border shadow-2xl"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-full text-4xl font-extrabold tracking-tight mb-4">
            <img src="/logo.png" className="h-[28px] w-auto object-contain mr-1" alt="Logo" />
            <span className="text-white">INNEXA</span>
            <span className="text-neutral-500">FIT</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">{t.registerTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t.registerDesc}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Role Toggle */}
          <div className="flex p-1 rounded-xl bg-background border border-border">
            <button
              type="button"
              onClick={() => setValue('role', 'COACH')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedRole === 'COACH' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'}`}
            >
              {language === 'en' ? "I'm a Coach" : "أنا مدرب"}
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'CLIENT')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedRole === 'CLIENT' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'}`}
            >
              {language === 'en' ? "I'm a Client" : "أنا متدرب"}
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'en' ? "Full Name *" : "الاسم الكامل *"}
            </label>
            <div className="relative">
              <User className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={15} />
              <input
                {...register('fullName')}
                className={`w-full ${language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                placeholder={language === 'en' ? "Ahmed Mohamed Ali" : "أحمد محمد علي"}
              />
            </div>
            {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Username with inline @innexafit.com suffix */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'en' ? "Username *" : "اسم المستخدم *"}
            </label>
            <div className={`flex items-stretch rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center px-3 flex-shrink-0">
                <AtSign size={15} className="text-muted-foreground" />
              </div>
              <input
                {...register('username')}
                className={`flex-1 py-3 text-sm bg-transparent outline-none min-w-0 ${language === 'ar' ? 'text-right' : ''}`}
                placeholder="ahmed_ali"
                autoComplete="username"
              />
              <div className={`flex items-center px-3 bg-primary/10 border-l border-border flex-shrink-0 ${language === 'ar' ? 'border-r border-l-0' : 'border-l'}`}>
                <span className="text-xs font-bold text-primary whitespace-nowrap">@innexafit.com</span>
              </div>
            </div>
            {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'en' ? "Phone Number *" : "رقم الهاتف *"}
            </label>
            <div className="relative">
              <Phone className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={15} />
              <input
                {...register('phone')}
                type="tel"
                className={`w-full ${language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                placeholder="+20 100 000 0000"
              />
            </div>
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.emailLabel} *</label>
            <div className="relative">
              <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={15} />
              <input
                {...register('email')}
                type="email"
                className={`w-full ${language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                placeholder="ahmed@example.com"
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>



          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'en' ? "Gender *" : "الجنس *"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Male', 'Female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setValue('gender', g, { shouldValidate: true })}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    watch('gender') === g
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {g === 'Male' 
                    ? (language === 'en' ? '♂ Male' : '♂ ذكر') 
                    : (language === 'en' ? '♀ Female' : '♀ أنثى')
                  }
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-destructive text-xs mt-1">{errors.gender.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.passwordLabel} *</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full ${language === 'ar' ? 'pl-12 pr-4 text-right' : 'pr-12 pl-4'} py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                placeholder={language === 'en' ? "Min 8 chars, upper+lower+number+symbol" : "8 رموز كحد أدنى، تشمل أحرف وأرقام ورموز خاصة"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            <PasswordStrengthBar password={watchPassword} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (language === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : t.registerBtn}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t.haveAccount}{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            {language === 'en' ? 'Login' : 'تسجيل الدخول'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
