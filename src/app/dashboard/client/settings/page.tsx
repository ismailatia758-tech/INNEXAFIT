'use client';

import React, { useState } from 'react';
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
  KeyRound
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

export default function ClientSettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuth();
  
  // State for Personal Info
  const [name, setName] = useState(user?.name || 'Athlete Name');
  const [dob, setDob] = useState('1998-08-20');
  const [phone, setPhone] = useState('+1 (555) 012-9876');
  const [email, setEmail] = useState(user?.email || 'client@innexafit.com');
  const [avatar, setAvatar] = useState<string | null>(null);

  // State for Account Info
  const [username, setUsername] = useState('athlete_user');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      toast.success('Your settings have been saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your personal details, email preferences, and password credentials.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Information */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-primary" />
              <span>Personal Information</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Details that help your coach identify you and customize your training.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
              <div className="w-28 h-28 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold relative overflow-hidden group">
                {avatar ? (
                  <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{name?.[0] || 'U'}</span>
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
            <p className="text-xs text-muted-foreground mt-0.5">Control your profile username and security credentials.</p>
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/95 transition-all disabled:opacity-50 shadow-md"
          >
            <Save size={18} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
