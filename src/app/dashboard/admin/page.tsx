'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  UserCheck,
  CreditCard,
  UserPlus,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Settings,
  ShieldAlert,
  Globe,
  Trash2,
  Search,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface CoachSubscription {
  id: string;
  name: string;
  email: string;
  planType: 'Monthly' | 'Yearly' | 'Free' | 'Pending';
  pricePaid: number;
  status: 'Active' | 'Expired' | 'Pending';
  startDate: string;
  expiryDate: string;
}

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info' | 'system';
}

interface PlatformClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  packageName: string;
  pricePaid: number;
  joinedType: 'New' | 'Old';
  status: 'Active' | 'Paused' | 'Expired';
}

const defaultCoaches: CoachSubscription[] = [];

const defaultCoachesClients: Record<string, PlatformClient[]> = {};

const revenueGrowthData: { name: string; value: number }[] = [];

export default function AdminDashboardPage() {
  const [coaches, setCoaches] = useState<CoachSubscription[]>([]);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  const [coachesClients, setCoachesClients] = useState<Record<string, PlatformClient[]>>({});
  const [selectedCoachForModal, setSelectedCoachForModal] = useState<string | null>(null);
  
  // Platform Configuration states
  const [monthlyPrice, setMonthlyPrice] = useState(49);
  const [yearlyPrice, setYearlyPrice] = useState(399);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  // Grant Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planType, setPlanType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [startDate, setStartDate] = useState('2026-06-07');
  const [price, setPrice] = useState(49);

  // Client Registration Form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPackage, setNewClientPackage] = useState('');
  const [newClientPrice, setNewClientPrice] = useState(100);
  const [newClientJoinedType, setNewClientJoinedType] = useState<'New' | 'Old'>('New');
  const [newClientCoachId, setNewClientCoachId] = useState('');
  const [clientRegistrySearch, setClientRegistrySearch] = useState('');

  const exportCoachesExcel = () => {
    const headers = ['ID', 'Coach Name', 'Email', 'Plan Type', 'Financial Rate', 'Expiry Date', 'Status', 'Clients Registered'];
    const rows = coaches.map(c => [
      c.id,
      c.name,
      c.email,
      c.planType,
      `EGP ${c.pricePaid}`,
      c.expiryDate,
      c.status,
      `${(coachesClients[c.id] || []).length} Trainees`
    ]);
    exportToExcel('coaches-subscriptions-directory', headers, rows);
  };

  const exportCoachesPDF = () => {
    const headers = ['الرقم التعريفي', 'اسم الكابتن', 'البريد الإلكتروني', 'نوع الخطة', 'سعر الاشتراك', 'تاريخ الانتهاء', 'الحالة', 'عدد المتدربين'];
    const rows = coaches.map(c => [
      c.id,
      c.name,
      c.email,
      c.planType === 'Monthly' ? 'شهري' : 'سنوي',
      `${c.pricePaid} ج.م`,
      c.expiryDate,
      c.status === 'Active' ? 'نشط' : 'منتهي',
      `${(coachesClients[c.id] || []).length} متدرب`
    ]);
    exportToPDF('دليل اشتراكات الكباتن - Coaches Subscriptions Directory', headers, rows, [
      { label: 'إجمالي الكباتن', value: String(coaches.length) },
      { label: 'الاشتراكات النشطة', value: String(coaches.filter(c => c.status === 'Active').length) },
      { label: 'إجمالي الدخل الشهري المتوقع', value: `${coaches.reduce((sum, c) => sum + (c.status === 'Active' ? c.pricePaid : 0), 0)} ج.م` }
    ]);
  };

  const getFilteredRegistryData = () => {
    return allClientsList.filter(client => {
      let coachName = '';
      for (const [cid, clist] of Object.entries(coachesClients)) {
        if (clist.some(c => c.id === client.id)) {
          coachName = coaches.find(co => co.id === cid)?.name || '';
          break;
        }
      }
      const query = clientRegistrySearch.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.packageName.toLowerCase().includes(query) ||
        coachName.toLowerCase().includes(query)
      );
    });
  };

  const exportRegistryExcel = () => {
    const data = getFilteredRegistryData();
    const headers = ['Client ID', 'Trainee Name', 'Phone Number', 'Email', 'Assigned Coach', 'Package', 'Price Paid', 'Joined Month', 'Status'];
    const rows = data.map(c => {
      let coachName = 'Unknown';
      for (const [cid, clist] of Object.entries(coachesClients)) {
        if (clist.some(x => x.id === c.id)) {
          coachName = coaches.find(co => co.id === cid)?.name || 'Unknown';
          break;
        }
      }
      return [
        c.id,
        c.name,
        c.phone,
        c.email,
        coachName,
        c.packageName,
        `EGP ${c.pricePaid}`,
        c.joinedType === 'New' ? 'New (June 2026)' : 'Old',
        c.status
      ];
    });
    exportToExcel('platform-client-registry', headers, rows);
  };

  const exportRegistryPDF = () => {
    const data = getFilteredRegistryData();
    const headers = ['اسم المتدرب', 'رقم الهاتف', 'البريد الإلكتروني', 'الكابتن المسؤول', 'الباقة التدريبية', 'سعر الاشتراك', 'تاريخ الانضمام', 'الحالة'];
    const rows = data.map(c => {
      let coachName = 'Unknown';
      for (const [cid, clist] of Object.entries(coachesClients)) {
        if (clist.some(x => x.id === c.id)) {
          coachName = coaches.find(co => co.id === cid)?.name || 'Unknown';
          break;
        }
      }
      return [
        c.name,
        c.phone,
        c.email,
        coachName,
        c.packageName,
        `${c.pricePaid} ج.م`,
        c.joinedType === 'New' ? 'جديد (هذا الشهر)' : 'قديم',
        c.status === 'Active' ? 'نشط' : c.status === 'Paused' ? 'موقوف مؤقتاً' : 'منتهي'
      ];
    });
    exportToPDF('السجل العام للمتدربين - Platform Client Registry', headers, rows, [
      { label: 'إجمالي المتدربين المصفين', value: String(data.length) },
      { label: 'متدربين نشطين', value: String(data.filter(c => c.status === 'Active').length) },
      { label: 'مجموع الدخل المستحق للكباتن', value: `${data.reduce((sum, c) => sum + c.pricePaid, 0)} ج.م` }
    ]);
  };

  const exportLogsExcel = () => {
    const headers = ['Log ID', 'Action Description', 'Timestamp', 'Log Level'];
    const rows = auditLogs.map(l => [
      l.id,
      l.action,
      l.timestamp,
      l.type
    ]);
    exportToExcel('platform-audit-logs', headers, rows);
  };

  const exportLogsPDF = () => {
    const headers = ['الرقم التعريفي', 'الإجراء المتخذ / وصف الحدث', 'الوقت والتاريخ', 'مستوى السجل'];
    const rows = auditLogs.map(l => [
      l.id,
      l.action,
      l.timestamp,
      l.type === 'success' ? 'نجاح' : l.type === 'warning' ? 'تحذير' : l.type === 'system' ? 'نظام' : 'معلومات'
    ]);
    exportToPDF('سجل الأحداث والعمليات للرقابة - Platform Audit Logs', headers, rows, [
      { label: 'إجمالي الأحداث المسجلة', value: String(auditLogs.length) },
      { label: 'التحذيرات النشطة', value: String(auditLogs.filter(l => l.type === 'warning').length) }
    ]);
  };

  // Load config & data from localStorage and API
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const coachesRes = await api.get('/admin/coaches');
        setCoaches(coachesRes.data);
      } catch (err) {
        console.error('Failed to load coaches from backend, falling back to localStorage', err);
        const savedCoaches = localStorage.getItem('platformCoaches');
        if (savedCoaches) {
          setCoaches(JSON.parse(savedCoaches));
        } else {
          setCoaches([]);
          localStorage.setItem('platformCoaches', JSON.stringify([]));
        }
      }

      try {
        const logsRes = await api.get('/admin/logs');
        setAuditLogs(logsRes.data);
      } catch (err) {
        console.error('Failed to load logs from backend, falling back to localStorage', err);
        const savedLogs = localStorage.getItem('platformAuditLogs');
        if (savedLogs) {
          setAuditLogs(JSON.parse(savedLogs));
        } else {
          const defaultLogs: AuditLog[] = [];
          setAuditLogs(defaultLogs);
          localStorage.setItem('platformAuditLogs', JSON.stringify(defaultLogs));
        }
      }
    };

    fetchBackendData();

    // 2. Coaches Clients Directory
    const savedCoachesClients = localStorage.getItem('platformCoachesClients');
    if (savedCoachesClients) {
      setCoachesClients(JSON.parse(savedCoachesClients));
    } else {
      setCoachesClients(defaultCoachesClients);
      localStorage.setItem('platformCoachesClients', JSON.stringify(defaultCoachesClients));
    }

    // 3. Platform settings config
    const savedConfig = localStorage.getItem('platformConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setMonthlyPrice(config.monthlyPrice ?? 49);
      setYearlyPrice(config.yearlyPrice ?? 399);
      setIsMaintenanceMode(config.isMaintenanceMode ?? false);
      setAllowRegistrations(config.allowRegistrations ?? true);
    } else {
      const defaultConfig = { monthlyPrice: 49, yearlyPrice: 399, isMaintenanceMode: false, allowRegistrations: true };
      localStorage.setItem('platformConfig', JSON.stringify(defaultConfig));
    }
  }, []);

  const addAuditLog = async (action: string, type: 'success' | 'warning' | 'info' | 'system') => {
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action,
      timestamp: new Date().toISOString(),
      type
    };

    try {
      await api.post('/admin/logs', { action, type });
      const logsRes = await api.get('/admin/logs');
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to save log to backend', err);
      const savedLogs = localStorage.getItem('platformAuditLogs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const updated = [newLog, ...logs].slice(0, 50);
      setAuditLogs(updated);
      localStorage.setItem('platformAuditLogs', JSON.stringify(updated));
    }
  };

  const updateConfig = (updates: Partial<{ monthlyPrice: number; yearlyPrice: number; isMaintenanceMode: boolean; allowRegistrations: boolean }>) => {
    const current = {
      monthlyPrice,
      yearlyPrice,
      isMaintenanceMode,
      allowRegistrations
    };
    const merged = { ...current, ...updates };
    
    if (updates.monthlyPrice !== undefined) {
      setMonthlyPrice(updates.monthlyPrice);
      if (planType === 'Monthly') setPrice(updates.monthlyPrice);
    }
    if (updates.yearlyPrice !== undefined) {
      setYearlyPrice(updates.yearlyPrice);
      if (planType === 'Yearly') setPrice(updates.yearlyPrice);
    }
    if (updates.isMaintenanceMode !== undefined) setIsMaintenanceMode(updates.isMaintenanceMode);
    if (updates.allowRegistrations !== undefined) setAllowRegistrations(updates.allowRegistrations);

    localStorage.setItem('platformConfig', JSON.stringify(merged));
    
    if (updates.monthlyPrice !== undefined) {
      addAuditLog(`Base Monthly License Fee updated to EGP ${updates.monthlyPrice}`, 'info');
    }
    if (updates.yearlyPrice !== undefined) {
      addAuditLog(`Base Yearly License Fee updated to EGP ${updates.yearlyPrice}`, 'info');
    }
    if (updates.isMaintenanceMode !== undefined) {
      addAuditLog(`Platform Maintenance Mode set to ${updates.isMaintenanceMode ? 'ENABLED' : 'DISABLED'}`, updates.isMaintenanceMode ? 'warning' : 'success');
    }
    if (updates.allowRegistrations !== undefined) {
      addAuditLog(`Public registrations set to ${updates.allowRegistrations ? 'ALLOWED' : 'SUSPENDED'}`, 'info');
    }
  };

  const handlePlanChange = (type: 'Monthly' | 'Yearly') => {
    setPlanType(type);
    setPrice(type === 'Monthly' ? monthlyPrice : yearlyPrice);
  };

  const openGrantModal = () => {
    setPlanType('Monthly');
    setPrice(monthlyPrice);
    setIsGrantModalOpen(true);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Auto-calculate expiry
    const start = new Date(startDate);
    const expiry = new Date(startDate);
    if (planType === 'Monthly') {
      expiry.setMonth(start.getMonth() + 1);
    } else {
      expiry.setFullYear(start.getFullYear() + 1);
    }

    const existingIndex = coaches.findIndex(c => c.email.toLowerCase() === email.trim().toLowerCase());

    if (existingIndex > -1) {
      // Update existing pending/inactive coach
      const coachId = coaches[existingIndex].id;
      const payload = {
        name: name.trim(),
        planType,
        pricePaid: price,
        status: 'Active' as const,
        startDate,
        expiryDate: expiry.toISOString().split('T')[0]
      };

      try {
        await api.put(`/admin/coaches/${coachId}`, payload);
        toast.success(`Coach ${name.trim()} activated and license updated successfully!`);
        addAuditLog(`Activated Coach ${name.trim()} (${planType} Plan - EGP ${price})`, 'success');
        
        // Reload coaches
        const coachesRes = await api.get('/admin/coaches');
        setCoaches(coachesRes.data);
      } catch (err) {
        console.error('Failed to update coach in backend, updating locally', err);
        const updated = [...coaches];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name: name.trim(),
          planType,
          pricePaid: price,
          status: 'Active' as const,
          startDate,
          expiryDate: expiry.toISOString().split('T')[0]
        };
        setCoaches(updated);
        localStorage.setItem('platformCoaches', JSON.stringify(updated));
        
        // Make sure they have a clients record
        if (!coachesClients[coachId]) {
          const updatedClients = { ...coachesClients, [coachId]: [] };
          setCoachesClients(updatedClients);
          localStorage.setItem('platformCoachesClients', JSON.stringify(updatedClients));
        }
        
        toast.success(`Coach ${name.trim()} activated locally (fallback)!`);
        addAuditLog(`Activated Coach ${name.trim()} (${planType} Plan - EGP ${price})`, 'success');
      }
    } else {
      // Register coach first via Auth Register
      try {
        const registerPayload = {
          name: name.trim(),
          email: email.trim(),
          password: 'Password123!', // default password for admin created coach
          role: 'COACH',
          username: email.trim().split('@')[0] + '@innexafit.com',
          phone: '+201000000000',
          gender: 'Male',
          birthDate: '1995-01-01'
        };
        const regRes = await api.post('/auth/register', registerPayload);
        const newCoachUser = regRes.data.user;

        // Now activate them
        await api.put(`/admin/coaches/${newCoachUser.id}`, {
          planType,
          pricePaid: price,
          status: 'Active',
          startDate,
          expiryDate: expiry.toISOString().split('T')[0]
        });

        toast.success(`Access granted to ${name.trim()} successfully!`);
        addAuditLog(`Granted license access to Coach ${name.trim()} (${planType} Plan - EGP ${price})`, 'success');

        const coachesRes = await api.get('/admin/coaches');
        setCoaches(coachesRes.data);
      } catch (err) {
        console.error('Failed to register/create coach in backend, using local fallback', err);
        // Create new coach
        const newCoach: CoachSubscription = {
          id: 'c-' + Math.random().toString(36).substr(2, 9),
          name: name.trim(),
          email: email.trim(),
          planType,
          pricePaid: price,
          status: 'Active' as const,
          startDate,
          expiryDate: expiry.toISOString().split('T')[0]
        };

        const updated = [...coaches, newCoach];
        setCoaches(updated);
        localStorage.setItem('platformCoaches', JSON.stringify(updated));

        const updatedClients = { ...coachesClients, [newCoach.id]: [] };
        setCoachesClients(updatedClients);
        localStorage.setItem('platformCoachesClients', JSON.stringify(updatedClients));

        toast.success(`Access granted to ${newCoach.name} locally (fallback)!`);
        addAuditLog(`Granted license access to Coach ${newCoach.name} (${newCoach.planType} Plan - EGP ${newCoach.pricePaid})`, 'success');
      }
    }

    // Reset Form
    setName('');
    setEmail('');
    setPlanType('Monthly');
    setPrice(monthlyPrice);
    setIsGrantModalOpen(false);
  };

  const handleExtendSubscription = async (coachId: string) => {
    let coachName = '';
    let plan = '';
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return;

    coachName = coach.name;
    plan = coach.planType;
    const currentExpiry = new Date(coach.expiryDate);
    const newExpiry = new Date(coach.expiryDate);
    if (coach.planType === 'Monthly') {
      newExpiry.setMonth(currentExpiry.getMonth() + 1);
    } else {
      newExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    }

    try {
      await api.put(`/admin/coaches/${coachId}`, {
        expiryDate: newExpiry.toISOString().split('T')[0],
        status: 'Active'
      });
      toast.success(`Subscription extended for ${coachName}`);
      addAuditLog(`Extended subscription license for Coach ${coachName} by 1 ${plan === 'Monthly' ? 'month' : 'year'}`, 'success');

      const coachesRes = await api.get('/admin/coaches');
      setCoaches(coachesRes.data);
    } catch (err) {
      console.error('Failed to extend subscription in backend, using local fallback', err);
      const updated = coaches.map((c) => {
        if (c.id === coachId) {
          toast.success(`Subscription extended for ${c.name}`);
          return {
            ...c,
            status: 'Active' as const,
            expiryDate: newExpiry.toISOString().split('T')[0]
          };
        }
        return c;
      });

      setCoaches(updated);
      localStorage.setItem('platformCoaches', JSON.stringify(updated));
      if (coachName) {
        addAuditLog(`Extended subscription license for Coach ${coachName} by 1 ${plan === 'Monthly' ? 'month' : 'year'}`, 'success');
      }
    }
  };

  const handleSendEmailAlert = (coachName: string, coachEmail: string) => {
    toast.success(`Renewal warning alert email sent to ${coachName} (${coachEmail})`);
    addAuditLog(`Renewal warning alert email sent to Coach ${coachName} (${coachEmail})`, 'warning');
  };

  const handleAddClientToCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim() || !newClientCoachId) {
      toast.error('Please fill in required fields');
      return;
    }

    const newClient: PlatformClient = {
      id: 'pc-' + Math.random().toString(36).substr(2, 9),
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim() || 'trainee@example.com',
      packageName: newClientPackage.trim() || 'General Fitness Package',
      pricePaid: newClientPrice,
      joinedType: newClientJoinedType,
      status: 'Active'
    };

    const coachName = coaches.find(c => c.id === newClientCoachId)?.name || 'Coach';
    const updatedCoachClients = [newClient, ...(coachesClients[newClientCoachId] || [])];
    const updatedAll = {
      ...coachesClients,
      [newClientCoachId]: updatedCoachClients
    };

    setCoachesClients(updatedAll);
    localStorage.setItem('platformCoachesClients', JSON.stringify(updatedAll));

    // Reset Form
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientPackage('');
    setNewClientPrice(100);
    setNewClientCoachId('');

    toast.success(`Registered ${newClient.name} under ${coachName} successfully!`);
    addAuditLog(`Registered new trainee ${newClient.name} (${newClient.phone}) under Coach ${coachName}`, 'success');
  };

  // SaaS Intelligence Calculations
  const allClientsList = Object.values(coachesClients).flat();
  const totalClientsCount = allClientsList.length;
  const newClientsCount = allClientsList.filter(c => c.joinedType === 'New').length;
  const oldClientsCount = totalClientsCount - newClientsCount;

  const newCoachesCount = coaches.filter(c => c.startDate >= '2026-06-01').length;
  const oldCoachesCount = coaches.length - newCoachesCount;

  const coachSaaSFeeSum = coaches.reduce((sum, c) => sum + (c.status === 'Active' ? c.pricePaid : 0), 0);
  const clientRevenueSum = allClientsList.reduce((sum, c) => sum + (c.status !== 'Expired' ? c.pricePaid : 0), 0);

  const getCoachClientEarnings = (coachId: string) => {
    const list = coachesClients[coachId] || [];
    return list.reduce((sum, c) => sum + (c.status !== 'Expired' ? c.pricePaid : 0), 0);
  };

  // Recalculate live stats
  const totalCoachesCount = coaches.length;
  const activeSubsCount = coaches.filter(c => c.status === 'Active').length;
  const expiredSubsCount = coaches.filter(c => c.status === 'Expired').length;
  const totalRevenueSum = coaches.reduce((acc, c) => acc + (c.status === 'Active' ? c.pricePaid : 0), 0);

  const platformStats = [
    { label: 'Total Coaches', value: String(totalCoachesCount), icon: Users, color: 'text-brand-purple' },
    { label: 'Active Subscriptions', value: String(activeSubsCount), icon: UserCheck, color: 'text-green-500' },
    { label: 'Expired Subscriptions', value: String(expiredSubsCount), icon: AlertCircle, color: 'text-red-500' },
    { label: 'Monthly Recurring Revenue', value: `EGP ${totalRevenueSum}`, icon: DollarSign, color: 'text-blue-500' },
  ];

  const userDistData = [
    { name: 'Active Subscriptions', value: activeSubsCount, color: '#22c55e' },
    { name: 'Expired Subscriptions', value: expiredSubsCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage platform coaches, active licenses, subscriptions, and financial metrics.</p>
        </div>
        <button
          onClick={openGrantModal}
          className="flex items-center justify-center space-x-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-all text-xs"
        >
          <UserPlus size={16} />
          <span>Grant Coach Access</span>
        </button>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'overview'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview & System Configurations
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'reports'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          SaaS Platform Analytics Report
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Dynamic Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-3xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-background border border-border ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-black mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Coach Subscription Table */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity size={20} className="text-brand-purple" />
                  <span>Coaches Subscriptions Directory</span>
                </h2>
                <span className="text-xs text-muted-foreground font-bold">{coaches.length} Registered Platforms</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportCoachesExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all"
                >
                  <FileSpreadsheet size={14} className="text-emerald-500" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={exportCoachesPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all"
                >
                  <FileText size={14} className="text-red-500" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="pb-4 uppercase tracking-wider px-4">Coach Info</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Plan Type</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Financial Rate</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Expiry Date</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Status</th>
                    <th className="pb-4 uppercase tracking-wider px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {coaches.map((coach) => {
                    const isActive = coach.status === 'Active';
                    const clientsList = coachesClients[coach.id] || [];
                    const activeClients = clientsList.filter(c => c.status === 'Active').length;
                    return (
                      <tr key={coach.id} className="group hover:bg-secondary/10 transition-all">
                        <td className="py-5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple font-black">
                              {coach.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-brand-purple transition-all">{coach.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{coach.email}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <button
                                  onClick={() => setSelectedCoachForModal(coach.id)}
                                  className="text-[10px] text-brand-purple font-bold hover:underline"
                                >
                                  {clientsList.length} Trainees ({activeClients} Active)
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-4 font-bold text-foreground">
                          {coach.planType} Plan
                        </td>

                        <td className="py-5 px-4 font-black text-foreground">
                          EGP {coach.pricePaid}
                        </td>

                        <td className="py-5 px-4 font-bold text-muted-foreground">
                          {coach.expiryDate}
                        </td>

                        <td className="py-5 px-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            coach.status === 'Active' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : coach.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {coach.status}
                          </span>
                        </td>

                        <td className="py-5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedCoachForModal(coach.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-brand-purple/15 text-foreground hover:text-brand-purple transition-all font-bold text-[10px] border border-border"
                            >
                              View Trainees
                            </button>
                            {!isActive && (
                              <button
                                onClick={() => handleSendEmailAlert(coach.name, coach.email)}
                                className="p-2 rounded-lg border border-border hover:bg-yellow-500/5 hover:text-yellow-500 hover:border-yellow-500/20 text-muted-foreground transition-all"
                                title="Send Email Alert Warning"
                              >
                                <Mail size={14} />
                              </button>
                            )}
                            {coach.status === 'Pending' ? (
                              <button
                                onClick={() => {
                                  setName(coach.name);
                                  setEmail(coach.email);
                                  setIsGrantModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-all shadow"
                              >
                                Activate License
                              </button>
                            ) : (
                              <button
                                onClick={() => handleExtendSubscription(coach.id)}
                                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-brand-purple hover:text-white transition-all font-bold text-[10px]"
                              >
                                Extend Plan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Analytics Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platform Revenue Growth Chart */}
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold">Platform SaaS Growth</h2>
                <span className="text-xs text-muted-foreground font-bold">Monthly earnings trends</span>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <Tooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" fill="#9333ea" radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coach Distribution Chart */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold">License Distributions</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ratio of active to expired licenses</p>
              </div>
               
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={64}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {userDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {userDistData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-black text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Configuration & Recent Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Settings Widget */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Settings size={20} className="text-brand-purple" />
                    <span>Global Settings</span>
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Configure platform properties & licensing rates.</p>
                </div>

                <div className="space-y-4">
                  {/* Monthly License Rate Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Monthly License Fee (EGP)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">EGP</span>
                      <input
                        type="number"
                        value={monthlyPrice}
                        onChange={(e) => updateConfig({ monthlyPrice: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Yearly License Rate Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Yearly License Fee (EGP)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">EGP</span>
                      <input
                        type="number"
                        value={yearlyPrice}
                        onChange={(e) => updateConfig({ yearlyPrice: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border text-xs">
                      <div>
                        <p className="font-bold text-foreground">Maintenance Mode</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Restrict client & coach logins</p>
                      </div>
                      <button
                        onClick={() => updateConfig({ isMaintenanceMode: !isMaintenanceMode })}
                        className={`w-11 h-6 rounded-full transition-all relative ${
                          isMaintenanceMode ? 'bg-yellow-500' : 'bg-secondary'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                          isMaintenanceMode ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border text-xs">
                      <div>
                        <p className="font-bold text-foreground">Open Registration</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Allow new coach registrations</p>
                      </div>
                      <button
                        onClick={() => updateConfig({ allowRegistrations: !allowRegistrations })}
                        className={`w-11 h-6 rounded-full transition-all relative ${
                          allowRegistrations ? 'bg-brand-purple' : 'bg-secondary'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                          allowRegistrations ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Globe size={12} className="text-green-500" />
                  <span>Platform Core Online</span>
                </span>
                {isMaintenanceMode && (
                  <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 text-[9px] uppercase">
                    Maintenance
                  </span>
                )}
              </div>
            </div>

            {/* Audit Log / Recent Activities */}
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <ShieldCheck size={20} className="text-brand-purple" />
                      <span>Recent Platform Activities</span>
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Real-time system events, audit logs, and security tracking.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={exportLogsExcel}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-secondary px-2.5 py-1.5 rounded-lg border border-border"
                    >
                      <FileSpreadsheet size={12} className="text-emerald-500" />
                      <span>Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportLogsPDF}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-secondary px-2.5 py-1.5 rounded-lg border border-border"
                    >
                      <FileText size={12} className="text-red-500" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuditLogs([]);
                        localStorage.setItem('platformAuditLogs', JSON.stringify([]));
                        toast.success('System audit logs cleared');
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors bg-secondary px-2.5 py-1.5 rounded-lg border border-border"
                    >
                      <Trash2 size={12} />
                      <span>Clear Logs</span>
                    </button>
                  </div>
                </div>

                {/* Logs List Container */}
                <div className="overflow-y-auto max-h-[260px] pr-2 space-y-3 custom-scrollbar">
                  {auditLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <ShieldAlert size={36} className="text-muted-foreground/60 mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">No recent activities recorded.</p>
                    </div>
                  ) : (
                    auditLogs.map((log) => {
                      let badgeColor = 'bg-brand-purple/10 text-brand-purple border-brand-purple/20';
                      if (log.type === 'success') badgeColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                      if (log.type === 'warning') badgeColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                      if (log.type === 'system') badgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';

                      return (
                        <div key={log.id} className="p-3.5 rounded-2xl bg-background border border-border flex items-start justify-between gap-4 text-xs transition-colors hover:border-primary/10">
                          <div className="flex items-start gap-3">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border mt-0.5 ${badgeColor}`}>
                              {log.type}
                            </span>
                            <p className="font-medium text-foreground leading-relaxed">{log.action}</p>
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap pt-1">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Platform Analytics & Reports tab */
        <div className="space-y-8">
          {/* Statistics Cards for reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-background border border-border text-brand-purple">
                  <Users size={22} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Total Coaches</p>
              <p className="text-3xl font-black mt-1">{totalCoachesCount}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">{newCoachesCount} New / {oldCoachesCount} Old</p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-background border border-border text-green-500">
                  <UserCheck size={22} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Total Trainees</p>
              <p className="text-3xl font-black mt-1">{totalClientsCount}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">{newClientsCount} New / {oldClientsCount} Old</p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-background border border-border text-blue-500">
                  <DollarSign size={22} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Monthly SaaS Income</p>
              <p className="text-3xl font-black mt-1">EGP {coachSaaSFeeSum}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">From active coach licenses</p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-background border border-border text-purple-500">
                  <TrendingUp size={22} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Monthly Client Income</p>
              <p className="text-3xl font-black mt-1">EGP {clientRevenueSum}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">From trainee subscriptions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coach Performance Leaderboard */}
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-purple" />
                    <span>Coach Earnings & Clients Leaderboard</span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold">
                        <th className="pb-4 uppercase tracking-wider px-4">Rank</th>
                        <th className="pb-4 uppercase tracking-wider px-4">Coach</th>
                        <th className="pb-4 uppercase tracking-wider px-4">Plan Type</th>
                        <th className="pb-4 uppercase tracking-wider px-4">Active Trainees</th>
                        <th className="pb-4 uppercase tracking-wider px-4">Total Earnings</th>
                        <th className="pb-4 uppercase tracking-wider px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {coaches
                        .map((c) => ({
                          ...c,
                          traineesCount: (coachesClients[c.id] || []).length,
                          earnings: getCoachClientEarnings(c.id)
                        }))
                        .sort((a, b) => b.earnings - a.earnings)
                        .map((coach, index) => {
                          const rankColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600';
                          return (
                            <tr key={coach.id} className="hover:bg-secondary/10 transition-all">
                              <td className="py-4 px-4 font-black text-sm">
                                <span className={rankColor}>#{index + 1}</span>
                              </td>
                              <td className="py-4 px-4 font-bold text-foreground">{coach.name}</td>
                              <td className="py-4 px-4 font-medium text-foreground">{coach.planType}</td>
                              <td className="py-4 px-4 font-black text-foreground">
                                {coach.traineesCount} clients
                              </td>
                              <td className="py-4 px-4 font-black text-brand-purple text-sm">
                                EGP {coach.earnings}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => setSelectedCoachForModal(coach.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-brand-purple/15 text-foreground hover:text-brand-purple transition-all font-bold text-[10px] border border-border"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Client Directly to Coach Form */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <UserPlus size={20} className="text-brand-purple" />
                  <span>Register Trainee</span>
                </h2>
                <p className="text-xs text-muted-foreground mb-6">Assign a trainee to a coach dynamically to update platform revenue logs.</p>

                <form onSubmit={handleAddClientToCoach} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Clark Kent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="+20 1..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="clark@mail.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Package Name</label>
                      <input
                        type="text"
                        value={newClientPackage}
                        onChange={(e) => setNewClientPackage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Fat Loss Pro"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly Fee (EGP)</label>
                      <input
                        type="number"
                        value={newClientPrice}
                        onChange={(e) => setNewClientPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Assigned Coach</label>
                      <select
                        value={newClientCoachId}
                        onChange={(e) => setNewClientCoachId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-muted-foreground focus:text-foreground font-bold"
                        required
                      >
                        <option value="">Select Coach</option>
                        {coaches.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Registry Term</label>
                      <select
                        value={newClientJoinedType}
                        onChange={(e) => setNewClientJoinedType(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-muted-foreground focus:text-foreground font-bold"
                        required
                      >
                        <option value="New">New Trainee</option>
                        <option value="Old">Old Trainee</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-purple text-white text-xs font-bold rounded-xl hover:bg-brand-purple/90 transition-all mt-2"
                  >
                    Register Trainee
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Platform-wide Client Registry */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users size={20} className="text-brand-purple" />
                  <span>Platform-Wide Client Registry</span>
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Directory search of all clients registered on INNEXA FIT.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    placeholder="Search by name, phone, email, coach..."
                    value={clientRegistrySearch}
                    onChange={(e) => setClientRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={exportRegistryExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all flex-1 md:flex-initial justify-center"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-500" />
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportRegistryPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all flex-1 md:flex-initial justify-center"
                  >
                    <FileText size={14} className="text-red-500" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="pb-4 uppercase tracking-wider px-4">Trainee Name</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Phone Number</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Email</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Assigned Coach</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Package</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Price Paid</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Joined Month</th>
                    <th className="pb-4 uppercase tracking-wider px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {allClientsList.filter(client => {
                    let coachName = '';
                    for (const [cid, clist] of Object.entries(coachesClients)) {
                      if (clist.some(c => c.id === client.id)) {
                        coachName = coaches.find(co => co.id === cid)?.name || '';
                        break;
                      }
                    }
                    const query = clientRegistrySearch.toLowerCase();
                    return (
                      client.name.toLowerCase().includes(query) ||
                      client.phone.includes(query) ||
                      client.email.toLowerCase().includes(query) ||
                      client.packageName.toLowerCase().includes(query) ||
                      coachName.toLowerCase().includes(query)
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No matching clients found in registry.
                      </td>
                    </tr>
                  ) : (
                    allClientsList.filter(client => {
                      let coachName = '';
                      for (const [cid, clist] of Object.entries(coachesClients)) {
                        if (clist.some(c => c.id === client.id)) {
                          coachName = coaches.find(co => co.id === cid)?.name || '';
                          break;
                        }
                      }
                      const query = clientRegistrySearch.toLowerCase();
                      return (
                        client.name.toLowerCase().includes(query) ||
                        client.phone.includes(query) ||
                        client.email.toLowerCase().includes(query) ||
                        client.packageName.toLowerCase().includes(query) ||
                        coachName.toLowerCase().includes(query)
                      );
                    }).map((client) => {
                      let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                      if (client.status === 'Paused') statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                      if (client.status === 'Expired') statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';

                      let coachName = 'Unknown';
                      for (const [cid, clist] of Object.entries(coachesClients)) {
                        if (clist.some(c => c.id === client.id)) {
                          coachName = coaches.find(co => co.id === cid)?.name || 'Unknown';
                          break;
                        }
                      }

                      return (
                        <tr key={client.id} className="hover:bg-secondary/10 transition-all">
                          <td className="py-4 px-4 font-bold text-foreground">{client.name}</td>
                          <td className="py-4 px-4 font-medium text-foreground">{client.phone}</td>
                          <td className="py-4 px-4 text-muted-foreground">{client.email}</td>
                          <td className="py-4 px-4 font-bold text-foreground">{coachName}</td>
                          <td className="py-4 px-4 text-muted-foreground">{client.packageName}</td>
                          <td className="py-4 px-4 font-black text-brand-purple">EGP {client.pricePaid}</td>
                          <td className="py-4 px-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              client.joinedType === 'New'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-secondary text-muted-foreground border-border'
                            }`}>
                              {client.joinedType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {client.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grant Access Modal */}
      <AnimatePresence>
        {isGrantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold mb-2">Grant Coach License</h2>
              <p className="text-xs text-muted-foreground mb-6">Authorize a new coach, set their subscription tier, and link their license dates.</p>
              
              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Coach Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. Coach David Miller"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. david@fitness.pro"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type={startDate ? "date" : "text"}
                      placeholder="yyyy-mm-dd"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.type = 'date';
                        try { e.currentTarget.showPicker(); } catch (err) {}
                      }}
                      onBlur={(e) => {
                      e.currentTarget.type = 'text';
                    }}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subscription Tier</label>
                    <div className="flex p-1 rounded-xl bg-background border border-border">
                      <button
                        type="button"
                        onClick={() => handlePlanChange('Monthly')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          planType === 'Monthly' 
                            ? 'bg-brand-purple text-white shadow-md' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlanChange('Yearly')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          planType === 'Yearly' 
                            ? 'bg-brand-purple text-white shadow-md' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">SaaS Revenue Stream</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tier licensing fee rate</p>
                  </div>
                  <span className="font-black text-brand-purple text-lg">EGP {price} Paid</span>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsGrantModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-purple text-white text-xs font-bold"
                  >
                    Grant Access
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Clients Modal */}
      <AnimatePresence>
        {selectedCoachForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {coaches.find(c => c.id === selectedCoachForModal)?.name}'s Trainees
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    List of clients registered under this coach, with contact info and plans.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCoachForModal(null)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all"
                >
                  Close
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold">
                      <th className="pb-4 uppercase tracking-wider px-4">Trainee Name</th>
                      <th className="pb-4 uppercase tracking-wider px-4">Phone Number</th>
                      <th className="pb-4 uppercase tracking-wider px-4">Email</th>
                      <th className="pb-4 uppercase tracking-wider px-4">Package Plan</th>
                      <th className="pb-4 uppercase tracking-wider px-4">Monthly Rate</th>
                      <th className="pb-4 uppercase tracking-wider px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(!coachesClients[selectedCoachForModal] || coachesClients[selectedCoachForModal].length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No trainees registered for this coach.
                        </td>
                      </tr>
                    ) : (
                      coachesClients[selectedCoachForModal].map((client) => {
                        let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                        if (client.status === 'Paused') statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                        if (client.status === 'Expired') statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';

                        return (
                          <tr key={client.id} className="hover:bg-secondary/5 transition-all">
                            <td className="py-4 px-4 font-bold text-foreground">{client.name}</td>
                            <td className="py-4 px-4 font-medium text-foreground">{client.phone}</td>
                            <td className="py-4 px-4 text-muted-foreground">{client.email}</td>
                            <td className="py-4 px-4 font-bold text-foreground">{client.packageName}</td>
                            <td className="py-4 px-4 font-black text-brand-purple">EGP {client.pricePaid}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {client.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
