'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuth();
  
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
        action: `Coach ${user?.name} switched licensing tier from ${coachSubscription.planType} to ${nextPlan} ($${nextPrice})`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      toast.success(`Switched plan to ${nextPlan} successfully!`);
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
                    <span className="text-sm font-bold text-white">${coachSubscription.pricePaid} USD</span>
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
                  <h4 className="text-sm font-bold mb-2">License Options</h4>
                  <p className="text-xs text-muted-foreground">
                    Extend your current licensing tier or switch to the alternative duration configuration set by the administrator.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExtendLicense}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group"
                  >
                    <div className="text-left">
                      <span className="block text-xs font-bold text-white">Extend {coachSubscription.planType} Subscription</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        Add 1 {coachSubscription.planType === 'Monthly' ? 'month' : 'year'} for ${coachSubscription.planType === 'Monthly' ? prices.monthly : prices.yearly}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:underline">Extend &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSwitchPlan}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5 hover:border-brand-purple/50 transition-all group"
                  >
                    <div className="text-left">
                      <span className="block text-xs font-bold text-white">
                        Switch to {coachSubscription.planType === 'Monthly' ? 'Yearly' : 'Monthly'} License
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        Switch to {coachSubscription.planType === 'Monthly' ? 'Yearly' : 'Monthly'} plan billing for ${coachSubscription.planType === 'Monthly' ? prices.yearly : prices.monthly}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:underline">Switch &rarr;</span>
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
    </div>
  );
}
