'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  KeyRound,
  ShieldCheck,
  Upload,
  X,
  Check,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useLanguage } from '@/store/useLanguage';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function SettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  // State for Personal Info
  const [name, setName] = useState(user?.name || 'Coach Innexa');
  const [dob, setDob] = useState('1990-05-15');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [email, setEmail] = useState(user?.email || 'coach@innexafit.com');
  const [avatar, setAvatar] = useState<string | null>(null);

  // State for Account Info
  const [username, setUsername] = useState('coach_innexa');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for Licensing
  const [coachSubscription, setCoachSubscription] = useState<any>(null);
  const [prices, setPrices] = useState({ monthly: 49, yearly: 399 });
  
  // Renewal Wizard states
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewPlan, setRenewPlan] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('platformConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setPrices({
        monthly: config.monthlyPrice ?? 49,
        yearly: config.yearlyPrice ?? 399
      });
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      const savedCoaches = localStorage.getItem('platformCoaches');
      const coaches = savedCoaches ? JSON.parse(savedCoaches) : [];
      const match = coaches.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
      if (match) {
        setCoachSubscription(match);
      } else {
        // If no subscription exists for this coach, create a mock one so they aren't left plan-less
        const config = JSON.parse(localStorage.getItem('platformConfig') || '{"monthlyPrice":49,"yearlyPrice":399}');
        const start = new Date().toISOString().split('T')[0];
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        const newMockSub = {
          id: 'c-' + Math.random().toString(36).substr(2, 9),
          name: user.name || 'Coach',
          email: user.email,
          planType: 'Monthly',
          pricePaid: config.monthlyPrice || 49,
          status: 'Active',
          startDate: start,
          expiryDate: expiry.toISOString().split('T')[0]
        };
        coaches.push(newMockSub);
        localStorage.setItem('platformCoaches', JSON.stringify(coaches));
        setCoachSubscription(newMockSub);
        
        // Also set client list if not exists
        const savedClientsStr = localStorage.getItem('platformCoachesClients');
        const coachesClients = savedClientsStr ? JSON.parse(savedClientsStr) : {};
        if (!coachesClients[newMockSub.id]) {
          coachesClients[newMockSub.id] = [];
          localStorage.setItem('platformCoachesClients', JSON.stringify(coachesClients));
        }
      }
    }
  }, [user]);

  const handleExtendLicense = () => {
    if (!coachSubscription) return;

    const savedCoachesStr = localStorage.getItem('platformCoaches');
    if (savedCoachesStr) {
      const coaches = JSON.parse(savedCoachesStr);
      let newExpiryDateStr = '';
      const price = coachSubscription.planType === 'Monthly' ? prices.monthly : prices.yearly;

      const updated = coaches.map((c: any) => {
        if (c.email.toLowerCase() === user?.email?.toLowerCase()) {
          const currentExpiry = new Date(c.expiryDate);
          const newExpiry = new Date(c.expiryDate);
          if (c.planType === 'Monthly') {
            newExpiry.setMonth(currentExpiry.getMonth() + 1);
          } else {
            newExpiry.setFullYear(currentExpiry.getFullYear() + 1);
          }
          newExpiryDateStr = newExpiry.toISOString().split('T')[0];

          const updatedCoach = {
            ...c,
            status: 'Active',
            pricePaid: price,
            expiryDate: newExpiryDateStr
          };
          setCoachSubscription(updatedCoach);
          return updatedCoach;
        }
        return c;
      });

      localStorage.setItem('platformCoaches', JSON.stringify(updated));

      // Log audit
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Coach ${user?.name} renewed/extended their ${coachSubscription.planType} license until ${newExpiryDateStr}`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      toast.success(`License extended successfully!`);
    }
  };

  const handleSwitchPlan = () => {
    if (!coachSubscription) return;

    const savedCoachesStr = localStorage.getItem('platformCoaches');
    if (savedCoachesStr) {
      const coaches = JSON.parse(savedCoachesStr);
      const nextPlan = coachSubscription.planType === 'Monthly' ? 'Yearly' : 'Monthly';
      const nextPrice = nextPlan === 'Monthly' ? prices.monthly : prices.yearly;
      let newExpiryDateStr = '';

      const updated = coaches.map((c: any) => {
        if (c.email.toLowerCase() === user?.email?.toLowerCase()) {
          const currentExpiry = new Date(c.expiryDate);
          const newExpiry = new Date(c.expiryDate);
          if (nextPlan === 'Monthly') {
            newExpiry.setMonth(currentExpiry.getMonth() + 1);
          } else {
            newExpiry.setFullYear(currentExpiry.getFullYear() + 1);
          }
          newExpiryDateStr = newExpiry.toISOString().split('T')[0];

          const updatedCoach = {
            ...c,
            status: 'Active',
            planType: nextPlan,
            pricePaid: nextPrice,
            expiryDate: newExpiryDateStr
          };
          setCoachSubscription(updatedCoach);
          return updatedCoach;
        }
        return c;
      });

      localStorage.setItem('platformCoaches', JSON.stringify(updated));

      // Log audit
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Coach ${user?.name} switched licensing tier from ${coachSubscription.planType} to ${nextPlan} (EGP ${nextPrice})`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      toast.success(`Switched plan to ${nextPlan} successfully!`);
    }
  };

  const handleRenewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('User session not found');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    setIsSubmittingRenewal(true);
    const formData = new FormData();
    formData.append('file', screenshotFile);

    try {
      // 1. Upload receipt image
      const uploadRes = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = uploadRes.data.fileUrl;

      // 2. Update status and screenshot in database
      const price = renewPlan === 'Monthly' ? prices.monthly : prices.yearly;
      await api.put(`/admin/coaches/${user.id}`, {
        status: 'Pending',
        planType: renewPlan,
        pricePaid: price,
        paymentScreenshot: fileUrl
      });

      // 3. Update localStorage platformCoaches list
      const savedCoachesStr = localStorage.getItem('platformCoaches');
      if (savedCoachesStr) {
        const coaches = JSON.parse(savedCoachesStr);
        const updated = coaches.map((c: any) => {
          if (c.email.toLowerCase() === user.email.toLowerCase()) {
            return {
              ...c,
              status: 'Pending',
              planType: renewPlan,
              pricePaid: price,
              paymentScreenshot: fileUrl
            };
          }
          return c;
        });
        localStorage.setItem('platformCoaches', JSON.stringify(updated));
      }

      // 4. Log Audit
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Coach ${user.name} submitted a renewal request (${renewPlan} Plan) and uploaded payment screenshot.`,
        timestamp: new Date().toISOString(),
        type: 'info'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      toast.success('Renewal request submitted successfully! Verifying payment details.');
      setIsRenewModalOpen(false);
      
      // Reload page so DashboardLayout immediately gates them with Step 5 (waiting for activation)
      window.location.reload();
    } catch (err) {
      toast.error('Failed to submit renewal request. Please try again.');
    } finally {
      setIsSubmittingRenewal(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success('Profile picture preview updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate database write
    setTimeout(() => {
      if (user) {
        // Update local Zustand auth store so name changes dynamically everywhere!
        const updatedUser = {
          ...user,
          name: name,
          email: email
        };
        setAuth(updatedUser, accessToken || 'mock-token', refreshToken || 'mock-token');
      }
      setIsSaving(false);
      toast.success('Profile and account settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your public coaching profile, personal information, and credentials.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Information */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-primary" />
              <span>Personal Information</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Details shown to your clients and on your public coach page.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
              <div className="w-28 h-28 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold relative overflow-hidden group">
                {avatar ? (
                  <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{name?.[0] || 'C'}</span>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all">
                  <Camera size={18} className="mb-1 text-primary-foreground" />
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">SVG, PNG, or JPG.<br/>Max size 2MB.</p>
            </div>

            {/* Inputs Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type={dob ? "date" : "text"}
                    placeholder="yyyy-mm-dd"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.type = 'date';
                      try { e.currentTarget.showPicker(); } catch (err) {}
                    }}
                    onBlur={(e) => {
                      e.currentTarget.type = 'text';
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <KeyRound size={20} className="text-primary" />
              <span>Account & Security</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Control your login identifier, secure password, and auth methods.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Licensing & Subscription */}
        {coachSubscription && (
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                <span>Licensing & Subscription</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your platform access, renewal dates, and payment tier.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Subscription Status Card */}
              <div className="p-6 rounded-2xl bg-background/50 border border-border/50 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Plan</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      coachSubscription.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {coachSubscription.status}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-white">
                    {coachSubscription.planType} License
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Running since {coachSubscription.startDate}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Cost / Rate</span>
                    <span className="text-sm font-bold text-white">EGP {coachSubscription.pricePaid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Renewal Date</span>
                    <span className="text-sm font-bold text-white">{coachSubscription.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Renewal / Upgrade Actions */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold mb-2">
                    {isEn ? 'License Renewal' : 'تجديد الترخيص'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isEn 
                      ? 'Renew your subscription license. You can choose a new billing plan and upload a transfer screenshot to activate.'
                      : 'قم بتجديد رخصة اشتراكك. يمكنك اختيار خطة فوترة جديدة ورفع لقطة شاشة لعملية التحويل للتفعيل.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsRenewModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group cursor-pointer"
                  >
                    <div className={isEn ? 'text-left' : 'text-right w-full'}>
                      <span className="block text-xs font-bold text-white">
                        {isEn ? 'Renew Subscription / تجديد الاشتراك' : 'تجديد الاشتراك / Renew Subscription'}
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {isEn 
                          ? 'Select a plan and upload a payment screenshot'
                          : 'حدد الباقة وقم برفع صورة إثبات الدفع'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:underline">
                      {isEn ? 'Renew' : 'تجديد'} &rarr;
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/95 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Renewal Modal */}
      <AnimatePresence>
        {isRenewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden text-right"
              dir={isEn ? "ltr" : "rtl"}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className={`absolute top-6 ${isEn ? 'right-6' : 'left-6'} p-1.5 rounded-xl border border-border bg-background/50 hover:bg-muted-foreground/10 transition-all text-muted-foreground hover:text-white cursor-pointer`}
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isEn ? 'Renew Subscription' : 'تجديد الاشتراك'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? 'Please choose your plan and upload payment proof' : 'الرجاء اختيار الباقة ورفع إثبات الدفع'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRenewSubmit} className="space-y-4 text-left">
                  {/* Plan Selection */}
                  <div>
                    <label className={`block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ${isEn ? 'text-left' : 'text-right'}`}>
                      {isEn ? 'Choose Plan' : 'اختر الباقة'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRenewPlan('Monthly')}
                        className={`p-4 rounded-2xl border text-center relative transition-all flex flex-col items-center justify-center cursor-pointer ${
                          renewPlan === 'Monthly'
                            ? 'border-primary bg-primary/5 shadow-md font-bold'
                            : 'border-border bg-background/50 hover:border-border/80'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                          {isEn ? 'Monthly' : 'شهري'}
                        </span>
                        <span className="text-base font-black text-white">EGP {prices.monthly}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mt-2 ${
                          renewPlan === 'Monthly' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                        }`}>
                          {renewPlan === 'Monthly' && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRenewPlan('Yearly')}
                        className={`p-4 rounded-2xl border text-center relative transition-all flex flex-col items-center justify-center cursor-pointer ${
                          renewPlan === 'Yearly'
                            ? 'border-primary bg-primary/5 shadow-md font-bold'
                            : 'border-border bg-background/50 hover:border-border/80'
                        }`}
                      >
                        <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[6px] font-black text-neutral-900 uppercase tracking-widest shadow">
                          {isEn ? 'Save Big' : 'توفير أكبر'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                          {isEn ? 'Yearly' : 'سنوي'}
                        </span>
                        <span className="text-base font-black text-white">EGP {prices.yearly}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mt-2 ${
                          renewPlan === 'Yearly' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                        }`}>
                          {renewPlan === 'Yearly' && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Transfer Info */}
                  <div className="p-4 rounded-2xl bg-background/60 border border-border/80 text-center space-y-3">
                    <div>
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">
                        {isEn ? 'Transfer Amount' : 'المبلغ المطلوب تحويله'}
                      </span>
                      <span className="text-xl font-black text-primary">
                        EGP {renewPlan === 'Monthly' ? prices.monthly : prices.yearly}
                      </span>
                    </div>

                    <div className="border-t border-border/30 pt-2">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider mb-1">
                        {isEn ? 'Transfer Account / Number' : 'رقم التحويل للمحفظة وانستاباي'}
                      </span>
                      <span className="text-lg font-black text-white tracking-widest block bg-card border border-border py-1.5 rounded-xl">
                        01110077531
                      </span>
                      <span className="text-[8px] text-yellow-500 block mt-1 leading-normal">
                        {isEn 
                          ? '* Both Instapay and Wallets transfer to this exact number.' 
                          : '* التحويل لانستاباي والمحافظ الإلكترونية يتم على هذا الرقم مباشرة.'}
                      </span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className={`block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ${isEn ? 'text-left' : 'text-right'}`}>
                      {isEn ? 'Upload Proof' : 'رفع إثبات الدفع'}
                    </label>
                    {screenshotPreview ? (
                      <div className="relative rounded-2xl border border-border overflow-hidden h-40 bg-background flex items-center justify-center group">
                        <img src={screenshotPreview} alt="Transfer Proof" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotFile(null);
                            setScreenshotPreview(null);
                          }}
                          className={`absolute top-2 ${isEn ? 'right-2' : 'left-2'} p-1.5 rounded-lg bg-black/70 border border-border hover:bg-red-500/20 hover:text-red-500 transition-all text-[10px] font-bold text-white cursor-pointer`}
                        >
                          {isEn ? 'Remove' : 'حذف'}
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-border hover:border-primary/50 transition-all rounded-2xl h-36 cursor-pointer bg-background/20 group">
                        <Upload size={24} className="text-muted-foreground group-hover:text-primary transition-all mb-1.5" />
                        <span className="text-xs font-bold text-white">
                          {isEn ? 'Choose Image' : 'اختر صورة الإيصال'}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">
                          JPEG, PNG, SVG up to 5MB
                        </span>
                        <input type="file" accept="image/*" onChange={handleRenewFileChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Submit Action */}
                  <button
                    type="submit"
                    disabled={isSubmittingRenewal || !screenshotFile}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>
                      {isSubmittingRenewal 
                        ? (isEn ? 'Submitting...' : 'جاري الإرسال...') 
                        : (isEn ? 'Submit & Confirm Payment' : 'إرسال وتأكيد عملية الدفع')}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
