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
  Layers,
  Plus,
  Trash2,
  Edit3,
  Check,
  CheckCircle,
  Sparkles,
  Info,
  Users
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge: string;
  theme: 'purple' | 'blue' | 'emerald' | 'gray';
  maxClients: number;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly License',
    price: 49,
    period: 'mo',
    description: 'Full access to all client management and workout systems on a monthly rolling license.',
    features: [
      'Unlimited client onboarding slots',
      'Professional Workout & Nutrition Library',
      'AI workout plan generator access',
      'Secure billing slots for trainee packages',
      'Priority customer support'
    ],
    cta: 'Subscribe Monthly',
    popular: false,
    badge: '',
    theme: 'purple',
    maxClients: 20
  },
  {
    id: 'yearly',
    name: 'Yearly License',
    price: 399,
    period: 'yr',
    description: 'Get all professional coaching privileges for a full year at a discounted rate.',
    features: [
      'Everything in the Monthly plan',
      'Save up to 30% compared to monthly rolling',
      'Dedicated server processing bandwidth',
      'Advanced visual metrics analytics reporting',
      '24/7 priority developer support access'
    ],
    cta: 'Subscribe Yearly',
    popular: true,
    badge: 'Best Value',
    theme: 'blue',
    maxClients: 100
  }
];

export default function AdminSettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing'>('profile');

  // State for Personal Info
  const [name, setName] = useState(user?.name || 'Administrator');
  const [dob, setDob] = useState('1988-10-10');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState(user?.email || 'admin@innexafit.com');
  const [avatar, setAvatar] = useState<string | null>(null);

  // State for Account Info
  const [username, setUsername] = useState('admin_innexa');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Pricing Plans Manager State ──
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  
  // Form state for adding/editing plan
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [planPeriod, setPlanPeriod] = useState('mo');
  const [planDesc, setPlanDesc] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');
  const [planCta, setPlanCta] = useState('Get Started');
  const [planPopular, setPlanPopular] = useState(false);
  const [planBadge, setPlanBadge] = useState('');
  const [planTheme, setPlanTheme] = useState<'purple' | 'blue' | 'emerald' | 'gray'>('purple');
  const [planMaxClients, setPlanMaxClients] = useState(50);

  // Load configuration from localStorage
  useEffect(() => {
    // Admin profile settings
    const savedProfile = localStorage.getItem('platformAdminProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.dob) setDob(profile.dob);
        if (profile.phone) setPhone(profile.phone);
        if (profile.avatar) setAvatar(profile.avatar);
        if (profile.username) setUsername(profile.username);
        if (profile.password) setPassword(profile.password);
      } catch (err) {
        console.error('Failed to parse admin profile settings', err);
      }
    }

    // Pricing packages
    const savedPlans = localStorage.getItem('platformPricingPlans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (err) {
        setPlans(defaultPlans);
      }
    } else {
      setPlans(defaultPlans);
      localStorage.setItem('platformPricingPlans', JSON.stringify(defaultPlans));
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success('Admin avatar preview updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          name: name,
          email: email
        };
        setAuth(updatedUser, accessToken || 'mock-token', refreshToken || 'mock-token');

        const adminProfile = {
          dob,
          phone,
          avatar,
          username,
          password
        };
        localStorage.setItem('platformAdminProfile', JSON.stringify(adminProfile));

        // Audit log
        const savedLogsStr = localStorage.getItem('platformAuditLogs');
        const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
        const newLog = {
          id: 'log-' + Math.random().toString(36).substr(2, 9),
          action: `Owner Profile details updated for Administrator (${email})`,
          timestamp: new Date().toISOString(),
          type: 'info'
        };
        localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));
      }
      setIsSaving(false);
      toast.success('Owner profile and settings updated successfully!');
    }, 800);
  };

  // ── Pricing Plans Manager Handlers ──
  const startAddPlan = () => {
    setEditingPlan({
      id: 'plan-' + Math.random().toString(36).substr(2, 9),
      name: '',
      price: 29,
      period: 'mo',
      description: '',
      features: [],
      cta: 'Subscribe Now',
      popular: false,
      badge: '',
      theme: 'purple',
      maxClients: 50
    });
    setPlanName('');
    setPlanPrice(29);
    setPlanPeriod('mo');
    setPlanDesc('');
    setPlanFeatures('');
    setPlanCta('Subscribe Now');
    setPlanPopular(false);
    setPlanBadge('');
    setPlanTheme('purple');
    setPlanMaxClients(50);
  };

  const startEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanPeriod(plan.period);
    setPlanDesc(plan.description);
    setPlanFeatures(plan.features.join('\n'));
    setPlanCta(plan.cta);
    setPlanPopular(plan.popular);
    setPlanBadge(plan.badge);
    setPlanTheme(plan.theme);
    setPlanMaxClients(plan.maxClients ?? 50);
  };

  const deletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription plan from the website?')) {
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated);
      localStorage.setItem('platformPricingPlans', JSON.stringify(updated));
      toast.success('Subscription plan deleted successfully');

      // Audit Log
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Subscription plan removed by Admin`,
        timestamp: new Date().toISOString(),
        type: 'warning'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));
    }
  };

  const savePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const parsedFeatures = planFeatures
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const updatedPlan: PricingPlan = {
      ...editingPlan,
      name: planName,
      price: Number(planPrice),
      period: planPeriod,
      description: planDesc,
      features: parsedFeatures,
      cta: planCta,
      popular: planPopular,
      badge: planBadge,
      theme: planTheme,
      maxClients: Number(planMaxClients)
    };

    let updatedPlans = [...plans];
    const index = plans.findIndex(p => p.id === editingPlan.id);
    if (index > -1) {
      updatedPlans[index] = updatedPlan;
    } else {
      updatedPlans.push(updatedPlan);
    }

    setPlans(updatedPlans);
    localStorage.setItem('platformPricingPlans', JSON.stringify(updatedPlans));
    setEditingPlan(null);
    toast.success('Website pricing plans saved successfully!');

    // Audit Log
    const savedLogsStr = localStorage.getItem('platformAuditLogs');
    const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: `Website subscription package "${planName}" added/updated by Admin (Client Limit: ${planMaxClients})`,
      timestamp: new Date().toISOString(),
      type: 'success'
    };
    localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Platform Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your administrative credentials, email alerts, and website pricing packages.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-card border border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User size={14} />
            <span>Profile & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pricing'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers size={14} />
            <span>Website Pricing Packages</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Personal Information */}
              <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
                <div className="border-b border-border/50 pb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    <span>Administrative Personal Information</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Details representing the main platform owner/operator.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
                    <div className="w-28 h-28 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold relative overflow-hidden group">
                      {avatar ? (
                        <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{name?.[0] || 'A'}</span>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all">
                        <Camera size={18} className="mb-1 text-primary-foreground" />
                        Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">SVG, PNG, or JPG.<br/>Max size 2MB.</p>
                  </div>

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

              {/* Administrative Account & Security */}
              <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
                <div className="border-b border-border/50 pb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <KeyRound size={20} className="text-primary" />
                    <span>Administrative Credentials & Security</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Control your admin portal login parameters and passwords.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin Username</label>
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
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin Password</label>
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

              <div className="flex justify-end">
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
          </motion.div>
        ) : (
          <motion.div
            key="pricing-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Package Management Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Packages List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Configured Packages</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">These packages are dynamically shown on the landing page.</p>
                  </div>
                  <button
                    onClick={startAddPlan}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-6 rounded-3xl border bg-card flex flex-col justify-between transition-all ${
                        plan.popular ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-border'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Theme: {plan.theme}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1">{plan.name}</h3>
                          </div>
                          {plan.badge && (
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 my-3">
                          <span className="text-3xl font-extrabold text-white">${plan.price}</span>
                          <span className="text-xs text-muted-foreground">/{plan.period}</span>
                        </div>

                        {/* Limit Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-[10px] font-bold text-primary-foreground my-2">
                          <Users size={12} className="text-primary" />
                          <span>Client Onboarding Limit: {plan.maxClients ?? 'Unlimited'}</span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 my-3">{plan.description}</p>
                        
                        <div className="space-y-1.5 mb-6">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Included Features:</p>
                          {plan.features.slice(0, 3).map((f, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-foreground/80">
                              <Check size={12} className="text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-[10px] text-primary font-bold">+{plan.features.length - 3} more features</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-border/50 pt-4 mt-auto">
                        <button
                          onClick={() => startEditPlan(plan)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold transition-all text-white"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="px-3 flex items-center justify-center py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Form */}
              <div className="space-y-6">
                {editingPlan ? (
                  <form onSubmit={savePlan} className="p-6 rounded-3xl bg-card border border-border space-y-5">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                      <Sparkles size={16} className="text-primary" />
                      <span>{planName ? `Edit Plan: ${planName}` : 'New Pricing Package'}</span>
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Package Name *</label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g. Premium Coach Monthly"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Price ($) *</label>
                        <input
                          type="number"
                          value={planPrice}
                          onChange={(e) => setPlanPrice(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          required
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Billing Period *</label>
                        <input
                          type="text"
                          value={planPeriod}
                          onChange={(e) => setPlanPeriod(e.target.value)}
                          placeholder="e.g. mo, yr, 3 months"
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Client Onboarding Limit */}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Max Onboarded Clients Limit *</label>
                      <input
                        type="number"
                        value={planMaxClients}
                        onChange={(e) => setPlanMaxClients(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        required
                        min={1}
                      />
                      <p className="text-[9px] text-muted-foreground mt-1">Maximum number of trainees this coach can add under this plan tier.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        value={planDesc}
                        onChange={(e) => setPlanDesc(e.target.value)}
                        rows={2}
                        placeholder="Short summary of this license tier"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Features List (one per line)
                      </label>
                      <textarea
                        value={planFeatures}
                        onChange={(e) => setPlanFeatures(e.target.value)}
                        rows={4}
                        placeholder="Unlimited Client Slots&#13;Workout Creator&#13;AI Routine Builder"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">CTA Button Text</label>
                        <input
                          type="text"
                          value={planCta}
                          onChange={(e) => setPlanCta(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Badge text (Optional)</label>
                        <input
                          type="text"
                          value={planBadge}
                          onChange={(e) => setPlanBadge(e.target.value)}
                          placeholder="e.g. Best Value, Save 20%"
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Visual Style Theme</label>
                        <select
                          value={planTheme}
                          onChange={(e) => setPlanTheme(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-white"
                        >
                          <option value="purple">Brand Purple</option>
                          <option value="blue">Ocean Blue</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="gray">Sleek Gray</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={planPopular}
                            onChange={(e) => setPlanPopular(e.target.checked)}
                            className="rounded border-border bg-background text-primary focus:ring-primary/20 w-4 h-4"
                          />
                          <span className="text-xs font-bold text-muted-foreground">Highlight (Popular)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="flex-1 py-3 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Save size={14} />
                        <span>Save Package</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary">
                      <Info size={20} />
                    </div>
                    <h3 className="font-bold text-sm">No Package Selected</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select any pricing package on the left to edit its details, or click "Add Package" to create a new licensing option for your website.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
