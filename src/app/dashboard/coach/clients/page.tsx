'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Smartphone, 
  Calendar, 
  ShieldAlert, 
  Check, 
  MoreVertical,
  Play,
  Pause,
  LogOut,
  Sparkles,
  Layers,
  Clock,
  UserX,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { useAuth } from '@/store/useAuth';
import { Users } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  packageName: string;
  status: 'Active' | 'Paused' | 'Expired';
  maxDevices: number;
  activeDevices: number;
  startDate: string;
  expiryDate: string;
  isLocked?: boolean;
  activeQuestionnaireId?: string | null;
  username?: string;
  phone?: string;
  gender?: 'Male' | 'Female';
  age?: number;
}

const defaultMockClients: Client[] = [];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Questionnaire Send States
  const [selectedClientForQ, setSelectedClientForQ] = useState<Client | null>(null);
  const [isQModalOpen, setIsQModalOpen] = useState(false);
  const [availableQnaires, setAvailableQnaires] = useState<any[]>([]);
  const [selectedQnaireId, setSelectedQnaireId] = useState('');
  
  // Platform License Limit States
  const { user } = useAuth();
  const [maxClientsLimit, setMaxClientsLimit] = useState(50);

  useEffect(() => {
    if (!user?.email) return;
    
    // Find this coach in platformCoaches
    const savedCoaches = localStorage.getItem('platformCoaches');
    const coaches = savedCoaches ? JSON.parse(savedCoaches) : [];
    const match = coaches.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
    
    if (match) {
      // Find pricing plan match
      const savedPlans = localStorage.getItem('platformPricingPlans');
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        const planMatch = plans.find((p: any) => 
          p.name.toLowerCase() === match.planType.toLowerCase() || 
          p.id === match.planType.toLowerCase()
        );
        if (planMatch && planMatch.maxClients) {
          setMaxClientsLimit(Number(planMatch.maxClients));
          return;
        }
      }
      
      // Fallbacks
      if (match.planType === 'Monthly' || match.planType === 'Monthly License') {
        setMaxClientsLimit(20);
      } else if (match.planType === 'Yearly' || match.planType === 'Yearly License') {
        setMaxClientsLimit(100);
      } else if (match.planType === 'Free') {
        setMaxClientsLimit(5);
      } else {
        setMaxClientsLimit(10);
      }
    }
  }, [user]);

  // Form & Search States
  const [searchQueryAdd, setSearchQueryAdd] = useState('');
  const [searchedClient, setSearchedClient] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);

  // Calculated values for Add modal
  const [calcStartDate, setCalcStartDate] = useState('');
  const [calcExpiryDate, setCalcExpiryDate] = useState('');
  const [calcDeviceLimit, setCalcDeviceLimit] = useState(3);

  // Helper: auto-calculate status based on date
  const evaluateStatus = (status: 'Active' | 'Paused' | 'Expired', expiryStr: string): 'Active' | 'Paused' | 'Expired' => {
    if (status === 'Paused') return 'Paused';
    
    const expiryDate = new Date(expiryStr);
    const today = new Date('2026-06-07'); // Local time constant from system context
    
    if (today > expiryDate) {
      return 'Expired';
    }
    return 'Active';
  };

  // Load packages and clients
  const fetchTraineeData = async () => {
    setLoading(true);
    
    // Load packages from backend
    try {
      const pkgsRes = await api.get('/coach/packages');
      setAvailablePackages(pkgsRes.data);
      if (pkgsRes.data.length > 0) {
        setSelectedPackageId(pkgsRes.data[0].id);
        recalculateDates(pkgsRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load packages from backend', err);
      const savedPackages = localStorage.getItem('subscriptionPackages');
      const pkgs = savedPackages ? JSON.parse(savedPackages) : [];
      setAvailablePackages(pkgs);
      if (pkgs.length > 0) {
        setSelectedPackageId(pkgs[0].id);
        recalculateDates(pkgs[0]);
      }
    }

    // Load clients from backend
    try {
      const clientsRes = await api.get('/coach/clients');
      const evaluatedClients = clientsRes.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '+201000000000',
        packageName: c.planType || 'Free',
        pricePaid: c.pricePaid || 0,
        status: evaluateStatus(c.status, c.expiryDate),
        expiryDate: c.expiryDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        startDate: c.startDate || new Date().toISOString().split('T')[0],
        gender: c.gender || 'Male',
        birthDate: c.birthDate || '1995-01-01'
      }));
      setClients(evaluatedClients);
    } catch (err) {
      console.error('Failed to load clients from backend', err);
      const savedClients = localStorage.getItem('coachClients');
      let clientList: Client[] = [];
      if (savedClients) {
        clientList = JSON.parse(savedClients);
      } else {
        clientList = defaultMockClients;
      }
      const evaluatedClients = clientList.map(c => ({
        ...c,
        status: evaluateStatus(c.status, c.expiryDate)
      }));
      setClients(evaluatedClients);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTraineeData();
  }, []);

  const recalculateDates = (pkg: any) => {
    if (!pkg) return;
    
    const today = new Date('2026-06-07');
    const startStr = today.toISOString().split('T')[0];
    
    let expiry = new Date('2026-06-07');
    if (pkg.durationType === 'Daily') {
      expiry.setDate(today.getDate() + pkg.durationValue);
    } else if (pkg.durationType === 'Weekly') {
      expiry.setDate(today.getDate() + (pkg.durationValue * 7));
    } else if (pkg.durationType === 'Monthly') {
      expiry.setMonth(today.getMonth() + pkg.durationValue);
    }

    const expiryStr = expiry.toISOString().split('T')[0];

    setCalcStartDate(startStr);
    setCalcExpiryDate(expiryStr);
    setCalcDeviceLimit(pkg.maxDevices);
  };

  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = availablePackages.find(p => p.id === pkgId);
    if (pkg) {
      recalculateDates(pkg);
    }
  };

  const handleSearchClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchedClient(null);

    const cleanQuery = searchQueryAdd.trim().toLowerCase();
    if (!cleanQuery) return;

    try {
      const searchRes = await api.get(`/coach/search-client?query=${encodeURIComponent(cleanQuery)}`);
      const found = searchRes.data;

      // Check if already registered under this coach
      const alreadyAdded = clients.some(c => c.email.toLowerCase() === found.email.toLowerCase());
      if (alreadyAdded) {
        setSearchError('This client is already registered under your account.');
        return;
      }

      setSearchedClient(found);
    } catch (err: any) {
      console.error('Failed to search client on backend, falling back to local list', err);
      // Local fallback
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const defaultClientUser = {
        id: 'mock-client-id',
        email: 'client@innexafit.com',
        role: 'CLIENT',
        name: 'John Doe',
        username: 'client@innexafit.com',
        phone: '+20 100 111 2222',
        gender: 'Male',
        birthDate: '1998-05-15'
      };

      const clientAccounts = [
        defaultClientUser,
        ...mockUsers.map((mu: any) => mu.user).filter((u: any) => u && u.role === 'CLIENT')
      ];

      const found = clientAccounts.find((u: any) => {
        const emailMatch = u.email?.toLowerCase() === cleanQuery;
        const phoneMatch = u.phone?.replace(/[\s\-\+]/g, '') === cleanQuery.replace(/[\s\-\+]/g, '');
        const usernameMatch = u.username?.toLowerCase() === cleanQuery || 
                              u.username?.split('@')[0].toLowerCase() === cleanQuery;
        return emailMatch || phoneMatch || usernameMatch;
      });

      if (!found) {
        setSearchError('No registered client account found with this username, email, or phone number.');
        return;
      }

      const alreadyAdded = clients.some(c => c.email.toLowerCase() === found.email.toLowerCase());
      if (alreadyAdded) {
        setSearchError('This client is already registered under your account.');
        return;
      }

      setSearchedClient(found);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchedClient || !selectedPackageId) {
      toast.error('Please search and select a client');
      return;
    }

    // Capacity check
    if (clients.length >= maxClientsLimit) {
      toast.error(`Subscription Limit Exceeded: Your current package limit allows a maximum of ${maxClientsLimit} clients. Please upgrade your tier in settings.`);
      return;
    }

    const pkg = availablePackages.find(p => p.id === selectedPackageId);
    if (!pkg) return;

    const calculateAge = (birthDateStr: string): number => {
      if (!birthDateStr) return 25;
      const birthDate = new Date(birthDateStr);
      const today = new Date('2026-06-07');
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const payload = {
      name: searchedClient.name,
      email: searchedClient.email,
      phone: searchedClient.phone || '+201000000000',
      gender: searchedClient.gender || 'Male',
      birthDate: searchedClient.birthDate || '1995-01-01',
      packageName: pkg.name,
      pricePaid: pkg.price,
      status: 'Active'
    };

    try {
      await api.post('/coach/clients', payload);
      toast.success('Client registered with ' + pkg.name + ' successfully!');
      
      // Reload trainees list
      fetchTraineeData();

      // Reset Search/Add Form
      setSearchQueryAdd('');
      setSearchedClient(null);
      setSearchError(null);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to register client to backend, using local fallback', err);
      // Local fallback
      const newClient: Client = {
        id: searchedClient.id || 'cli-' + Math.random().toString(36).substr(2, 9),
        name: searchedClient.name,
        email: searchedClient.email,
        packageName: pkg.name,
        status: 'Active',
        maxDevices: calcDeviceLimit,
        activeDevices: 0,
        startDate: calcStartDate,
        expiryDate: calcExpiryDate,
        username: searchedClient.username || searchedClient.name.toLowerCase().replace(/\s+/g, ''),
        phone: searchedClient.phone || '+20 123 456 789',
        gender: searchedClient.gender || 'Male',
        age: calculateAge(searchedClient.birthDate)
      };

      const updated = [...clients, newClient];
      setClients(updated);
      localStorage.setItem('coachClients', JSON.stringify(updated));

      // Reset Search/Add Form
      setSearchQueryAdd('');
      setSearchedClient(null);
      setSearchError(null);
      setIsAddModalOpen(false);
      toast.success('Client registered with ' + pkg.name + ' successfully!');
    }
  };

  // Toggle Pause/Resume
  const handleToggleStatus = (clientId: string) => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        if (c.status === 'Expired') return c; // Cannot toggle expired
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        toast.success(`Client ${c.name} access ${newStatus === 'Active' ? 'Resumed' : 'Paused'}`);
        return { ...c, status: newStatus as any };
      }
      return c;
    });
    setClients(updated);
    localStorage.setItem('coachClients', JSON.stringify(updated));
  };

  // Logout All Devices Safety Lock
  const handleLogoutDevices = (clientId: string, clientName: string) => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        toast.success(`Logged out all active devices for ${clientName}`);
        return { ...c, activeDevices: 0 };
      }
      return c;
    });
    localStorage.setItem('coachClients', JSON.stringify(updated));
  };

  useEffect(() => {
    if (user?.email) {
      const savedQs = localStorage.getItem('platformQuestionnaires');
      const allQs = savedQs ? JSON.parse(savedQs) : [];
      const coachQs = allQs.filter((q: any) => q.coachEmail.toLowerCase() === user.email.toLowerCase());
      setAvailableQnaires(coachQs);
      if (coachQs.length > 0) {
        setSelectedQnaireId(coachQs[0].id);
      }
    }
  }, [user]);

  const handleSendQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForQ || !selectedQnaireId) return;

    const qName = availableQnaires.find(q => q.id === selectedQnaireId)?.title || 'Questionnaire';

    const updated = clients.map(c => {
      if (c.id === selectedClientForQ.id) {
        return {
          ...c,
          isLocked: true,
          activeQuestionnaireId: selectedQnaireId
        };
      }
      return c;
    });

    setClients(updated);
    localStorage.setItem('coachClients', JSON.stringify(updated));

    // Audit Log Entry
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: `Coach ${user?.name || user?.email} sent questionnaire "${qName}" to trainee "${selectedClientForQ.name}" and locked their dashboard.`,
      timestamp: new Date().toISOString(),
      type: 'warning'
    };
    const savedLogs = localStorage.getItem('platformAuditLogs');
    const auditLogs = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

    toast.success(`Questionnaire sent! Trainee dashboard locked.`);
    setIsQModalOpen(false);
    setSelectedClientForQ(null);
  };

  const handleUnlockClient = (clientId: string) => {
    const clientName = clients.find(c => c.id === clientId)?.name || 'Trainee';

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          isLocked: false,
          activeQuestionnaireId: null
        };
      }
      return c;
    });

    setClients(updated);
    localStorage.setItem('coachClients', JSON.stringify(updated));

    // Audit Log Entry
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: `Coach ${user?.name || user?.email} unlocked trainee "${clientName}" dashboard manually.`,
      timestamp: new Date().toISOString(),
      type: 'info'
    };
    const savedLogs = localStorage.getItem('platformAuditLogs');
    const auditLogs = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

    toast.success(`Client dashboard unlocked.`);
  };

  const exportClientsExcel = () => {
    const headers = ['Trainee Name', 'Username', 'Email', 'Phone Number', 'Gender', 'Age'];
    const rows = filteredClients.map(c => [
      c.name,
      c.username || c.name.toLowerCase().replace(/\s+/g, ''),
      c.email,
      c.phone || '+20 123 456 789',
      c.gender || 'Male',
      c.age || 25
    ]);
    exportToExcel('trainees-data-report', headers, rows);
  };

  const exportClientsPDF = () => {
    const headers = ['Trainee Name', 'Username', 'Email', 'Phone Number', 'Gender', 'Age'];
    const rows = filteredClients.map(c => [
      c.name,
      c.username || c.name.toLowerCase().replace(/\s+/g, ''),
      c.email,
      c.phone || '+20 123 456 789',
      c.gender || 'Male',
      String(c.age || 25)
    ]);
    exportToPDF('Trainee Data Report', headers, rows, [
      { label: 'Total Clients', value: String(filteredClients.length) }
    ]);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Hub</h1>
          <p className="text-muted-foreground mt-2">Manage your trainees, review device activity, and customize package subscriptions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={exportClientsExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-bold transition-all flex-1 md:flex-initial justify-center"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={exportClientsPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-bold transition-all flex-1 md:flex-initial justify-center"
          >
            <FileText size={16} className="text-red-500" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQueryAdd('');
              setSearchedClient(null);
              setSearchError(null);
              setIsAddModalOpen(true);
              if (availablePackages.length > 0) recalculateDates(availablePackages[0]);
            }}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex-1 md:flex-initial"
          >
            <UserPlus size={20} />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Onboarding Capacity Progress Bar */}
      <div className="p-5 rounded-3xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 flex-shrink-0">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Onboarded Client Capacity</h4>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white">{clients.length}</span>
            <span className="text-sm font-bold text-muted-foreground">/ {maxClientsLimit} slots utilized</span>
          </div>
        </div>
        <div className="flex-1 max-w-lg w-full">
          <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                clients.length >= maxClientsLimit 
                  ? 'bg-rose-500' 
                  : clients.length >= maxClientsLimit * 0.8 
                    ? 'bg-amber-500' 
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min((clients.length / maxClientsLimit) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground mt-2">
            <span>{Math.max(0, maxClientsLimit - clients.length)} slots remaining</span>
            <span>{Math.round((clients.length / maxClientsLimit) * 100)}% capacity filled</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search by name, email or subscription package..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
        />
      </div>

      {/* Trainees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-card animate-pulse border border-border" />
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-card border border-dashed border-border">
            <UserX className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-lg font-bold">No trainees found</p>
            <p className="text-muted-foreground text-xs mt-1">Start by registering your first client with an active subscription package.</p>
          </div>
        ) : (
          filteredClients.map((client, i) => {
            let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
            if (client.status === 'Paused') statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            if (client.status === 'Expired') statusColor = 'bg-destructive/10 text-destructive border-destructive/20';

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-3xl bg-card border border-border hover:border-primary/20 transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                        {client.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-none">{client.name}</h3>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{client.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {client.isLocked && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-500">
                          Locked
                        </span>
                      )}
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-3 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Package</span>
                      <span className="text-xs font-bold text-foreground text-right">{client.packageName}</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Devices Logged</span>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Smartphone size={12} className="text-primary" />
                        <span>{client.activeDevices} / {client.maxDevices}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline border-t border-border/40 pt-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Expires</span>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span>{client.expiryDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="space-y-2 pt-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(client.id)}
                      disabled={client.status === 'Expired'}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        client.status === 'Expired'
                          ? 'bg-secondary text-muted-foreground border-transparent cursor-not-allowed opacity-40'
                          : client.status === 'Paused'
                          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
                          : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                      }`}
                    >
                      {client.status === 'Paused' ? (
                        <>
                          <Play size={12} />
                          <span>Resume Access</span>
                        </>
                      ) : (
                        <>
                          <Pause size={12} />
                          <span>Pause Access</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleLogoutDevices(client.id, client.name)}
                      disabled={client.activeDevices === 0}
                      className="px-3 py-2.5 rounded-xl border border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 text-muted-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Logout All Devices"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>

                  {client.isLocked ? (
                    <button
                      onClick={() => handleUnlockClient(client.id)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all mt-2"
                    >
                      Unlock Access
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedClientForQ(client);
                        setIsQModalOpen(true);
                      }}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all mt-2"
                    >
                      Send Questionnaire
                    </button>
                  )}
                  
                  <Link href={`/dashboard/coach/clients/${client.id}`}>
                    <button className="w-full py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all mt-2">
                      View Member Profile
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Trainee Modal (Integrated with Packages) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold mb-2">Register New Client</h2>
            <p className="text-xs text-muted-foreground mb-6">Search for a client by their registered username, email, or phone number to link them with a package.</p>
            
            {availablePackages.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-2xl">
                <p className="text-sm font-bold">No packages configured</p>
                <p className="text-xs text-muted-foreground mt-1">Please create a package in the Package Builder first.</p>
                <Link href="/dashboard/coach/packages">
                  <button onClick={() => setIsAddModalOpen(false)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl">
                    Configure Packages
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search Form */}
                <form onSubmit={handleSearchClient} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search Registered Client</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQueryAdd}
                        onChange={(e) => setSearchQueryAdd(e.target.value)}
                        placeholder="Enter username, email, or phone number..."
                        className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  {searchError && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                      {searchError}
                    </p>
                  )}
                </form>

                {/* Found Client details & Package selection */}
                {searchedClient && (
                  <form onSubmit={handleAddClient} className="space-y-6 pt-4 border-t border-border/60">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Client Account Found</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Name</p>
                          <p className="font-bold text-white mt-0.5">{searchedClient.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Username</p>
                          <p className="font-bold text-white mt-0.5">{searchedClient.username}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Email</p>
                          <p className="font-bold text-white mt-0.5 truncate">{searchedClient.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Phone Number</p>
                          <p className="font-bold text-white mt-0.5">{searchedClient.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Subscription Package</label>
                      <select
                        value={selectedPackageId}
                        onChange={(e) => handlePackageChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-white"
                      >
                        {availablePackages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.price === 0 ? 'Free' : `$${pkg.price}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Auto Calculated Integration View */}
                    <div className="p-5 rounded-2xl bg-background border border-border/80 space-y-3">
                      <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary">
                        <Sparkles size={14} />
                        <span>Auto-Configured Rules</span>
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-card border border-border/40">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground">Start Date</p>
                          <p className="font-bold text-xs mt-1">{calcStartDate}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/40">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground">Expiry Date</p>
                          <p className="font-bold text-xs mt-1 text-primary">{calcExpiryDate}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/40">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground">Device Limit</p>
                          <p className="font-bold text-xs mt-1 flex items-center justify-center gap-1">
                            <Smartphone size={12} />
                            <span>Max {calcDeviceLimit}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          setSearchedClient(null);
                          setSearchError(null);
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                      >
                        Add Client
                      </button>
                    </div>
                  </form>
                )}

                {!searchedClient && (
                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Questionnaire Send Modal */}
      {isQModalOpen && selectedClientForQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-2">Send Mandatory Questionnaire</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Select a questionnaire to send to <span className="text-primary font-bold">{selectedClientForQ.name}</span>. This will lock their dashboard until answered.
            </p>

            {availableQnaires.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-2xl">
                <p className="text-sm font-bold">No questionnaires built yet</p>
                <p className="text-xs text-muted-foreground mt-1">Please create a questionnaire in the Questionnaires Builder first.</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setIsQModalOpen(false); setSelectedClientForQ(null); }} className="flex-1 py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl">
                    Close
                  </button>
                  <Link href="/dashboard/coach/questionnaires" className="flex-1">
                    <button className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl">
                      Create One
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendQuestionnaire} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Questionnaire</label>
                  <select
                    value={selectedQnaireId}
                    onChange={(e) => setSelectedQnaireId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-white"
                  >
                    {availableQnaires.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.questions.length} questions)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsQModalOpen(false); setSelectedClientForQ(null); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Send & Lock
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
