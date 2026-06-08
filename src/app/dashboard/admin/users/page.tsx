'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Edit2,
  CheckCircle,
  Briefcase,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrative Manager' | 'CS Representative' | 'Accountant';
  permission: 'Viewer' | 'Editor' | 'Full Admin';
  joined: string;
}

const defaultStaff: StaffUser[] = [
  {
    id: 's-1',
    name: 'Emily Watson',
    email: 'emily@innexa-fit.com',
    role: 'Administrative Manager',
    permission: 'Full Admin',
    joined: '2026-03-12'
  },
  {
    id: 's-2',
    name: 'Robert Johnson',
    email: 'robert@support.pro',
    role: 'CS Representative',
    permission: 'Viewer',
    joined: '2026-05-15'
  },
  {
    id: 's-3',
    name: 'Sophia Lee',
    email: 'sophia@finance.pro',
    role: 'Accountant',
    permission: 'Editor',
    joined: '2026-05-20'
  }
];

export default function AdminUsersPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Administrative Manager' | 'CS Representative' | 'Accountant'>('CS Representative');
  const [permission, setPermission] = useState<'Viewer' | 'Editor' | 'Full Admin'>('Viewer');

  // Load staff list
  useEffect(() => {
    const saved = localStorage.getItem('platformStaff');
    if (saved) {
      setStaffList(JSON.parse(saved));
    } else {
      setStaffList(defaultStaff);
      localStorage.setItem('platformStaff', JSON.stringify(defaultStaff));
    }
  }, []);

  const addAuditLog = (action: string, type: 'success' | 'warning' | 'info' | 'system') => {
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action,
      timestamp: new Date().toISOString(),
      type
    };
    const savedLogs = localStorage.getItem('platformAuditLogs');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    const updated = [newLog, ...logs].slice(0, 50);
    localStorage.setItem('platformAuditLogs', JSON.stringify(updated));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newStaff: StaffUser = {
      id: 's-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.trim(),
      role,
      permission,
      joined: new Date().toISOString().split('T')[0]
    };

    const updated = [...staffList, newStaff];
    setStaffList(updated);
    localStorage.setItem('platformStaff', JSON.stringify(updated));

    // Reset Form
    setName('');
    setEmail('');
    setRole('CS Representative');
    setPermission('Viewer');
    setIsAddModalOpen(false);

    toast.success(`Staff member ${newStaff.name} onboarded successfully!`);
    addAuditLog(`Onboarded new staff member ${newStaff.name} as ${newStaff.role} (${newStaff.permission} access)`, 'success');
  };

  // RBAC Permission Simulation
  const handleEditAction = (staff: StaffUser) => {
    if (staff.permission === 'Viewer') {
      toast.error(
        `Permission Denied: Viewer accounts (${staff.name}) cannot modify platform records.`,
        { icon: '🚫', duration: 4000 }
      );
      addAuditLog(`Blocked: Attempt to modify platform records by Viewer account (${staff.name})`, 'warning');
      return;
    }
    toast.success(`Edit simulation allowed for: ${staff.name} (${staff.permission} access granted).`);
    addAuditLog(`Simulated edit operation performed by ${staff.name} (${staff.permission})`, 'info');
  };

  const handleDeleteAction = (staff: StaffUser) => {
    if (staff.permission === 'Viewer') {
      toast.error(
        `Permission Denied: Viewer accounts (${staff.name}) are restricted from editing or deleting records.`,
        { icon: '🚫', duration: 4000 }
      );
      addAuditLog(`Blocked: Attempt to delete records by Viewer account (${staff.name})`, 'warning');
      return;
    }
    if (staff.permission === 'Editor') {
      toast.error(
        `Permission Denied: Editor accounts (${staff.name}) can modify details, but cannot delete records from the system.`,
        { icon: '🚫', duration: 4000 }
      );
      addAuditLog(`Blocked: Attempt to delete records by Editor account (${staff.name})`, 'warning');
      return;
    }

    // Full Admin - execute delete
    const updated = staffList.filter((s) => s.id !== staff.id);
    setStaffList(updated);
    localStorage.setItem('platformStaff', JSON.stringify(updated));
    toast.success(`Removed staff user: ${staff.name} successfully.`);
    addAuditLog(`Removed staff user account for ${staff.name} successfully`, 'info');
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Admin Management</h1>
          <p className="text-muted-foreground mt-1">Configure assistants and simulate Role-Based Access Control (RBAC) permissions.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-all text-xs"
        >
          <UserPlus size={16} />
          <span>Create New Staff</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              placeholder="Search by staff name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex space-x-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-muted-foreground focus:text-foreground"
            >
               <option value="All">All Departmental Roles</option>
               <option value="Administrative Manager">Administrative Manager</option>
               <option value="CS Representative">CS Representative</option>
               <option value="Accountant">Accountant</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold">
                <th className="pb-4 uppercase tracking-wider px-4">Staff User</th>
                <th className="pb-4 uppercase tracking-wider px-4">Department Role</th>
                <th className="pb-4 uppercase tracking-wider px-4">RBAC Permission</th>
                <th className="pb-4 uppercase tracking-wider px-4">Joined Date</th>
                <th className="pb-4 uppercase tracking-wider px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStaff.map((staff) => {
                let badgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                if (staff.permission === 'Editor') badgeColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                if (staff.permission === 'Full Admin') badgeColor = 'bg-brand-purple/10 text-brand-purple border-brand-purple/20';

                return (
                  <tr key={staff.id} className="group hover:bg-secondary/15 transition-all">
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-bold">
                          {staff.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-brand-purple transition-all">{staff.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-4 font-medium text-foreground flex items-center gap-1.5 mt-3 border-none">
                      <Briefcase size={12} className="text-muted-foreground" />
                      <span>{staff.role}</span>
                    </td>

                    <td className="py-5 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {staff.permission}
                      </span>
                    </td>

                    <td className="py-5 px-4 text-muted-foreground font-bold">
                      {staff.joined}
                    </td>

                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditAction(staff)}
                          className="p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                          title="Simulate Edit Action"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAction(staff)}
                          className="p-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive text-muted-foreground transition-all"
                          title="Simulate Delete Action"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Info Card */}
      <div className="p-6 rounded-[2rem] bg-card border border-border space-y-4 max-w-2xl">
        <h4 className="font-bold text-xs flex items-center gap-1.5 text-brand-purple">
          <ShieldCheck size={16} />
          <span>Role-Based Access Control Rules (RBAC)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-background border border-border/80">
            <p className="font-bold text-foreground mb-1 text-green-500">1. Viewer Account</p>
            <p className="text-[11px]">Can view statistics, charts, and directories. Editing details or deleting data is blocked.</p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border/80">
            <p className="font-bold text-foreground mb-1 text-yellow-500">2. Editor Account</p>
            <p className="text-[11px]">Can view reports and edit coach/member details. Deleting records is strictly locked.</p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border/80">
            <p className="font-bold text-foreground mb-1 text-brand-purple">3. Full Admin Account</p>
            <p className="text-[11px]">Has unrestricted owner privilege. Can write, edit, and delete records without locks.</p>
          </div>
        </div>
      </div>

      {/* Onboard Staff Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold mb-2">Onboard Administrative Staff</h2>
              <p className="text-xs text-muted-foreground mb-6">Create a new assistant account and configure their access credentials and permissions tier.</p>
              
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Staff Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. Emily Jenkins"
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
                    placeholder="e.g. emily@support.pro"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Departmental Role</label>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-muted-foreground focus:text-foreground"
                    >
                      <option value="Administrative Manager">Administrative Manager</option>
                      <option value="CS Representative">CS Representative</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">RBAC Permissions</label>
                    <select 
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-muted-foreground focus:text-foreground"
                    >
                      <option value="Viewer">Viewer (Read-Only)</option>
                      <option value="Editor">Editor (Write-No Delete)</option>
                      <option value="Full Admin">Full Admin (Unrestricted)</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-purple text-white text-xs font-bold"
                  >
                    Onboard Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
