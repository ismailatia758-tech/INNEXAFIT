'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Check, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkedDevice {
  id: string;
  name: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ClientBillingPage() {
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  
  // Interactive device management mock
  const [devices, setDevices] = useState<LinkedDevice[]>([
    { id: 'dev-1', name: 'iPhone 15 Pro Max (My Phone)', lastActive: 'Active now', isCurrent: true },
    { id: 'dev-2', name: 'MacBook Air M3', lastActive: '2 hours ago', isCurrent: false }
  ]);
  const [deviceNameInput, setDeviceNameInput] = useState('');

  useEffect(() => {
    // Read subscription packages from coach setup
    const savedPackages = localStorage.getItem('subscriptionPackages');
    const packages = savedPackages ? JSON.parse(savedPackages) : [];
    if (packages.length > 0) {
      setActiveSubscription(packages[0]); // Mock first package as active
    }
  }, []);

  const handleLinkDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceNameInput.trim()) return;

    const limit = activeSubscription ? activeSubscription.maxDevices : 3;
    if (devices.length >= limit) {
      toast.error(`Device limit reached! Your package allows a maximum of ${limit} devices.`);
      return;
    }

    const newDevice: LinkedDevice = {
      id: 'dev-' + Math.random().toString(36).substr(2, 9),
      name: deviceNameInput.trim(),
      lastActive: 'Just now',
      isCurrent: false
    };

    const updated = [...devices, newDevice];
    setDevices(updated);
    setDeviceNameInput('');
    toast.success('New device linked successfully!');
  };

  const handleRemoveDevice = (id: string, name: string) => {
    const target = devices.find(d => d.id === id);
    if (target?.isCurrent) {
      toast.error('Cannot unlink your active current browsing device!');
      return;
    }

    const updated = devices.filter(d => d.id !== id);
    setDevices(updated);
    toast.success(`Removed device: ${name}`);
  };

  const limit = activeSubscription ? activeSubscription.maxDevices : 3;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-2">Manage your package plan, invoices, and active linked device credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Active Subscription & Receipts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Package Card */}
          {activeSubscription ? (
            <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Active Plan</span>
                  <h2 className="text-2xl font-black">{activeSubscription.name}</h2>
                </div>
                <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border/80 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Price Rate</p>
                  <p className="text-lg font-black mt-1">${activeSubscription.price}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">per {activeSubscription.durationValue} {activeSubscription.durationType === 'Monthly' ? 'Month(s)' : activeSubscription.durationType === 'Weekly' ? 'Week(s)' : 'Day(s)'}</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-background border border-border/80 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Registered Devices</p>
                  <p className="text-lg font-black mt-1">{devices.length} / {limit}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Slots occupied</p>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border/80 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Renewal Date</p>
                  <p className="text-lg font-black mt-1 text-primary">2026-07-09</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">32 days remaining</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                <ShieldAlert size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <p>Changing subscriptions requires approval from your coach. If you would like to switch to a different plan, please message your coach to update your status.</p>
              </div>
            </div>
          ) : (
            <div className="p-10 border border-dashed border-border rounded-3xl text-center bg-card">
              <ShieldAlert className="mx-auto text-muted-foreground mb-4" size={40} />
              <p className="font-bold text-lg">No subscription registered</p>
              <p className="text-xs text-muted-foreground mt-1">Please ask your coach to assign you a package in the Client Hub.</p>
            </div>
          )}

          {/* Payment Receipts History */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              <span>Payment Receipts History</span>
            </h3>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Receipt Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-4 font-bold text-foreground">2026-06-09</td>
                      <td className="p-4 text-muted-foreground">Subscription Renewal - Premium Muscle Builder</td>
                      <td className="p-4 font-bold">$149.00</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-green-500 font-bold">
                          <Check size={14} className="stroke-[3]" />
                          <span>Paid</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">2026-05-09</td>
                      <td className="p-4 text-muted-foreground">Subscription Renewal - Premium Muscle Builder</td>
                      <td className="p-4 font-bold">$149.00</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-green-500 font-bold">
                          <Check size={14} className="stroke-[3]" />
                          <span>Paid</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">2026-04-09</td>
                      <td className="p-4 text-muted-foreground">Initial Sign Up - Premium Muscle Builder</td>
                      <td className="p-4 font-bold">$149.00</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-green-500 font-bold">
                          <Check size={14} className="stroke-[3]" />
                          <span>Paid</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Device linking settings */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Smartphone size={20} className="text-primary" />
                <span>Device Licensing</span>
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Your subscription package permits up to **{limit} simultaneous devices** to access your training logs.
              </p>
            </div>

            {/* Devices list */}
            <div className="space-y-3">
              {devices.map((dev) => (
                <div key={dev.id} className="p-4 rounded-xl bg-background border border-border/80 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{dev.name}</p>
                    <p className="text-[9px] text-muted-foreground">Last active: {dev.lastActive}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveDevice(dev.id, dev.name)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                    title="Unlink Device"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Link device form */}
            {devices.length < limit ? (
              <form onSubmit={handleLinkDevice} className="space-y-3 pt-4 border-t border-border/60">
                <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Link New Device</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. iPad Pro"
                    value={deviceNameInput}
                    onChange={(e) => setDeviceNameInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Link</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/15 text-[10px] text-destructive text-center leading-relaxed">
                Device slots full! Unlink an existing browser session before adding a new device credentials slot.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
