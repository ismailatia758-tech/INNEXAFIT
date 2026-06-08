'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Utensils, 
  CheckSquare, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  MessageSquare,
  Package,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';
import { cn } from '@/lib/utils';

const coachMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/coach' },
  { icon: Users, label: 'Client Management', href: '/dashboard/coach/clients' },
  { icon: Dumbbell, label: 'Workout Library', href: '/dashboard/coach/workouts' },
  { icon: Utensils, label: 'Nutrition Library', href: '/dashboard/coach/nutrition' },
  { icon: CheckSquare, label: 'Progress Reports', href: '/dashboard/coach/progress' },
  { icon: CreditCard, label: 'Financial Reports', href: '/dashboard/coach/financials' },
  { icon: Package, label: 'Package Builder', href: '/dashboard/coach/packages' },
  { icon: ClipboardList, label: 'Questionnaires', href: '/dashboard/coach/questionnaires' },
  { icon: MessageSquare, label: 'Chat/Messages', href: '/dashboard/coach/chat' },
  { icon: Settings, label: 'Profile Settings', href: '/dashboard/coach/settings' },
];

const clientMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/client' },
  { icon: CheckSquare, label: 'Weekly Check-in', href: '/dashboard/client/checkins/new' },
  { icon: Dumbbell, label: 'My Workout', href: '/dashboard/client/workout' },
  { icon: Utensils, label: 'My Meal Plan', href: '/dashboard/client/nutrition' },
  { icon: CreditCard, label: 'My Subscription', href: '/dashboard/client/billing' },
  { icon: MessageSquare, label: 'Chat with Coach', href: '/dashboard/client/chat' },
  { icon: Settings, label: 'Profile Settings', href: '/dashboard/client/settings' },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Owner Dashboard', href: '/dashboard/admin' },
  { icon: Users, label: 'Staff Management', href: '/dashboard/admin/users' },
  { icon: Settings, label: 'Profile Settings', href: '/dashboard/admin/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const t = translations[language].sidebar;

  const translateLabel = (label: string) => {
    switch (label) {
      case 'Dashboard': return t.dashboard;
      case 'Client Management': return t.clients;
      case 'Workout Library': return t.workouts;
      case 'Nutrition Library': return t.nutrition;
      case 'Progress Reports': return t.progress;
      case 'Financial Reports': return t.financials;
      case 'Package Builder': return t.packages;
      case 'Chat/Messages': return t.chat;
      case 'Profile Settings': return t.settings;
      case 'Weekly Check-in': return language === 'en' ? 'Weekly Check-in' : 'التقرير الأسبوعي';
      case 'My Workout': return language === 'en' ? 'My Workout' : 'جدول التمارين';
      case 'My Meal Plan': return language === 'en' ? 'My Meal Plan' : 'خطة التغذية';
      case 'My Subscription': return language === 'en' ? 'My Subscription' : 'اشتراكي والمدفوعات';
      case 'Chat with Coach': return t.chat;
      case 'Owner Dashboard': return language === 'en' ? 'Owner Dashboard' : 'لوحة تحكم المالك';
      case 'Staff Management': return t.staff;
      case 'Questionnaires': return language === 'en' ? 'Questionnaires' : 'الاستبيانات الإلزامية';
      default: return label;
    }
  };

  const role = user?.role || 'COACH';
  let menuItems = coachMenuItems;
  if (role === 'CLIENT') {
    menuItems = clientMenuItems;
  } else if (role === 'ADMIN') {
    menuItems = adminMenuItems;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-45 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0 animate-in slide-in-from-left" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center text-3xl font-extrabold tracking-tight">
            <img src="/logo.png" className="h-[24px] w-auto object-contain mr-1" alt="Logo" />
            <span className="text-white">INNEXA</span>
            <span className="text-neutral-500">FIT</span>
          </Link>
        </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                <span className="font-medium">{translateLabel(item.label)}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center space-x-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
        >
          <LogOut size={20} className="text-destructive" />
          <span className="font-medium text-destructive">{t.logout}</span>
        </button>
      </div>
    </aside>

    {/* Logout Confirmation Dialog (Safety Protocol) */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in scale-in duration-200">
          <h3 className="text-xl font-bold mb-2">{t.confirmLogout}</h3>
          <p className="text-xs text-muted-foreground mb-6">{t.logoutDesc}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-3 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all"
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              onClick={logout}
              className="flex-1 py-3 bg-destructive text-destructive-foreground text-xs font-bold rounded-xl hover:bg-destructive/90 transition-all"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
