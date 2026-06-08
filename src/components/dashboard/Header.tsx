'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User, ShieldAlert, DollarSign, MessageSquare, CheckSquare, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

interface Notification {
  id: string;
  type: 'message' | 'payment' | 'report';
  text: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].header;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const statusRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage and sync across components
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('coachNotifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const defaultNotifs: Notification[] = [
          { id: '1', type: 'message', text: 'John Doe sent a new message', time: '5m ago', read: false },
          { id: '2', type: 'payment', text: 'Received payment of $49.00 from Emma', time: '1h ago', read: false },
          { id: '3', type: 'report', text: 'Sarah J. uploaded a pending progress report', time: '3h ago', read: false },
        ];
        localStorage.setItem('coachNotifications', JSON.stringify(defaultNotifs));
        setNotifications(defaultNotifs);
      }
    };

    loadNotifications();

    window.addEventListener('storage', loadNotifications);
    // Support a custom event for same-tab updates
    window.addEventListener('sync-notifications', loadNotifications);
    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('sync-notifications', loadNotifications);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('coachNotifications', JSON.stringify(updated));
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('coachNotifications', JSON.stringify(updated));
  };

  const getStatusDetails = () => {
    switch (status) {
      case 'online':
        return { color: 'bg-green-500', text: language === 'en' ? 'Online' : 'متصل' };
      case 'busy':
        return { color: 'bg-yellow-500', text: language === 'en' ? 'Busy' : 'مشغول' };
      case 'offline':
        return { color: 'bg-gray-500', text: language === 'en' ? 'Offline' : 'غير متصل' };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <header className="h-20 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground lg:hidden rounded-xl hover:bg-secondary/50 transition-all"
        >
          <Menu size={22} />
        </button>
        <div className="lg:hidden flex items-center text-2xl font-extrabold tracking-tight">
          <img src="/logo.png" className="h-[18px] w-auto object-contain mr-1" alt="Logo" />
          <span className="text-white">INNEXA</span>
          <span className="text-neutral-500">FIT</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Status Indicator */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${statusDetails.color} animate-pulse`} />
            <span className="text-xs font-bold hidden sm:inline">{statusDetails.text}</span>
          </button>

          <AnimatePresence>
            {isStatusOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-36 rounded-2xl bg-card border border-border p-1.5 shadow-xl z-50"
              >
                <button
                  onClick={() => { setStatus('online'); setIsStatusOpen(false); }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold rounded-lg hover:bg-secondary transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span>{language === 'en' ? 'Online' : 'متصل'}</span>
                </button>
                <button
                  onClick={() => { setStatus('busy'); setIsStatusOpen(false); }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold rounded-lg hover:bg-secondary transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span>{language === 'en' ? 'Busy' : 'مشغول'}</span>
                </button>
                <button
                  onClick={() => { setStatus('offline'); setIsStatusOpen(false); }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold rounded-lg hover:bg-secondary transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                  <span>{language === 'en' ? 'Offline' : 'غير متصل'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center border-2 border-card">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-card border border-border p-4 shadow-xl z-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm">{t.notifications}</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      {t.markAllRead}
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">{t.noNotifications}</p>
                  ) : (
                    notifications.map((n) => {
                      let Icon = Bell;
                      let color = 'text-primary';
                      if (n.type === 'message') { Icon = MessageSquare; color = 'text-blue-500'; }
                      else if (n.type === 'payment') { Icon = DollarSign; color = 'text-green-500'; }
                      else if (n.type === 'report') { Icon = CheckSquare; color = 'text-purple-500'; }

                      return (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkSingleRead(n.id)}
                          className={`flex items-start space-x-3 p-2 rounded-xl transition-all cursor-pointer hover:bg-secondary/50 ${n.read ? 'opacity-60' : 'bg-secondary/30'}`}
                        >
                          <div className={`p-2 rounded-lg bg-secondary/80 border border-border mt-0.5 ${color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-relaxed text-foreground truncate">{n.text}</p>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">{n.time}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
