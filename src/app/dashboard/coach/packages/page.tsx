'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Smartphone, 
  Check, 
  Plus, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface SubscriptionPackage {
  id: string;
  name: string;
  durationType: 'Daily' | 'Weekly' | 'Monthly';
  durationValue: number;
  price: number;
  maxDevices: number;
  isTrial: boolean;
  trialDuration?: number;
}

const defaultPackages: SubscriptionPackage[] = [
  {
    id: 'pkg-1',
    name: 'Premium Muscle Builder',
    durationType: 'Monthly',
    durationValue: 3,
    price: 149,
    maxDevices: 3,
    isTrial: false
  },
  {
    id: 'pkg-2',
    name: 'Quick Fat Loss Trial',
    durationType: 'Daily',
    durationValue: 7,
    price: 0,
    maxDevices: 1,
    isTrial: true,
    trialDuration: 7
  },
  {
    id: 'pkg-3',
    name: 'Elite Strength Coaching',
    durationType: 'Monthly',
    durationValue: 6,
    price: 299,
    maxDevices: 5,
    isTrial: false
  }
];

export default function PackageBuilderPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  
  // Form States
  const [name, setName] = useState('');
  const [durationType, setDurationType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [durationValue, setDurationValue] = useState(1);
  const [price, setPrice] = useState(49);
  const [maxDevices, setMaxDevices] = useState(3);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDuration, setTrialDuration] = useState(7);

  // Assign/Renew States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPkgForAssign, setSelectedPkgForAssign] = useState<SubscriptionPackage | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('2026-06-07');
  const [clientsList, setClientsList] = useState<any[]>([]);

  // Load packages from localStorage or set defaults
  useEffect(() => {
    const saved = localStorage.getItem('subscriptionPackages');
    if (saved) {
      try {
        // Strip image property from stored packages if present
        const parsed: SubscriptionPackage[] = JSON.parse(saved).map(({ image, ...rest }: any) => rest);
        setPackages(parsed);
      } catch (e) {
        setPackages(defaultPackages);
      }
    } else {
      setPackages(defaultPackages);
      localStorage.setItem('subscriptionPackages', JSON.stringify(defaultPackages));
    }
  }, []);

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Package name is required');
      return;
    }

    const newPkg: SubscriptionPackage = {
      id: 'pkg-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      durationType,
      durationValue: Number(durationValue),
      price: isTrial ? 0 : Number(price),
      maxDevices: Number(maxDevices),
      isTrial,
      trialDuration: isTrial ? Number(trialDuration) : undefined
    };

    const updated = [...packages, newPkg];
    setPackages(updated);
    localStorage.setItem('subscriptionPackages', JSON.stringify(updated));

    // Reset Form
    setName('');
    setDurationValue(1);
    setPrice(49);
    setMaxDevices(3);
    setIsTrial(false);
    
    toast.success('Subscription package created successfully!');
  };

  const loadClients = () => {
    const saved = localStorage.getItem('coachClients');
    const list = saved ? JSON.parse(saved) : [];
    setClientsList(list);
  };

  const handleOpenAssignModal = (pkg: SubscriptionPackage) => {
    setSelectedPkgForAssign(pkg);
    setSearchClientQuery('');
    setSelectedClientId('');
    setCustomStartDate('2026-06-07');
    loadClients();
    setIsAssignModalOpen(true);
  };

  const handleAssignPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkgForAssign || !selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    const client = clientsList.find(c => c.id === selectedClientId);
    if (!client) return;

    // Calculate new expiry date based on customStartDate
    const getNewExpiryDate = (startDateStr: string, durationType: string, durationValue: number): string => {
      const baseDate = new Date(startDateStr);
      if (isNaN(baseDate.getTime())) {
        return startDateStr;
      }
      
      const newExpiry = new Date(baseDate);
      if (durationType === 'Daily') {
        newExpiry.setDate(baseDate.getDate() + durationValue);
      } else if (durationType === 'Weekly') {
        newExpiry.setDate(baseDate.getDate() + (durationValue * 7));
      } else if (durationType === 'Monthly') {
        newExpiry.setMonth(baseDate.getMonth() + durationValue);
      }
      return newExpiry.toISOString().split('T')[0];
    };

    const newExpiry = getNewExpiryDate(customStartDate, selectedPkgForAssign.durationType, selectedPkgForAssign.durationValue);

    // Update client list
    const updatedClients = clientsList.map(c => {
      if (c.id === selectedClientId) {
        return {
          ...c,
          packageName: selectedPkgForAssign.name,
          status: 'Active',
          startDate: customStartDate,
          expiryDate: newExpiry,
          maxDevices: selectedPkgForAssign.maxDevices,
          activeDevices: 0 // Reset devices to prevent lockout issues
        };
      }
      return c;
    });

    localStorage.setItem('coachClients', JSON.stringify(updatedClients));
    toast.success(`Subscription package "${selectedPkgForAssign.name}" successfully active for ${client.name}! (New Expiry: ${newExpiry})`);
    setIsAssignModalOpen(false);
    setSelectedPkgForAssign(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Package Builder</h1>
        <p className="text-muted-foreground mt-2">Design, price, and customize training packages and subscriptions for your clients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Creator Form */}
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-card border border-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Layers size={20} className="text-primary" />
            <span>Create New Package</span>
          </h2>

          <form onSubmit={handleCreatePackage} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Package Name</label>
              <input
                type="text"
                placeholder="e.g. Shred & Tone Program"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration Type</label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration Value</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Trial Toggle */}
            <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Trial Mode</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Designate package as free trial</p>
              </div>
              <input
                type="checkbox"
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
            </div>

            {isTrial ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4"
              >
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Trial Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={trialDuration}
                  onChange={(e) => setTrialDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 1 }}
                className="relative"
              >
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="number"
                    min="0"
                    placeholder="99"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Device Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="uppercase text-muted-foreground tracking-wider">Max Device Limit</span>
                <span className="text-primary">{maxDevices} {maxDevices === 1 ? 'Device' : 'Devices'}</span>
              </div>
              <input 
                type="range" min="1" max="10" value={maxDevices}
                onChange={(e) => setMaxDevices(Number(e.target.value))}
                className="w-full h-1.5 bg-background border border-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/95 transition-all mt-4"
            >
              <Plus size={16} />
              <span>Create Package</span>
            </button>
          </form>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package size={20} className="text-primary" />
              <span>Package Gallery</span>
            </h2>
            <span className="text-xs text-muted-foreground font-bold">{packages.length} active products</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[2.5rem] bg-card border border-border overflow-hidden flex flex-col group hover:border-primary/20 transition-all shadow-sm"
              >
                <div className="p-6 flex flex-col justify-between h-full space-y-6">
                  {/* Top Info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {pkg.isTrial ? <Sparkles size={18} /> : <Package size={18} />}
                      </div>
                      {pkg.isTrial && (
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-wider">
                          Free Trial
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <Clock size={12} className="text-muted-foreground/80" />
                        <span>
                          Duration: {pkg.durationValue} {pkg.durationType}
                          {pkg.isTrial && ` (Trial: ${pkg.trialDuration} days)`}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing / Details Footer */}
                  <div className="flex justify-between items-center pt-5 border-t border-border/60">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Price</p>
                      <p className="text-2xl font-black text-foreground mt-0.5">
                        {pkg.price === 0 ? 'FREE' : `$${pkg.price}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Devices</p>
                      <p className="text-sm font-bold text-foreground flex items-center justify-end gap-1 mt-1">
                        <Smartphone size={14} className="text-primary/70" />
                        <span>Max {pkg.maxDevices}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/40">
                    <button
                      onClick={() => handleOpenAssignModal(pkg)}
                      className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30 rounded-xl text-xs font-bold transition-all"
                    >
                      Assign / Renew Client
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign / Renew Subscription Modal */}
      {isAssignModalOpen && selectedPkgForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-2">Assign / Renew Subscription</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Assign package <span className="text-primary font-bold">"{selectedPkgForAssign.name}"</span> to a client. This will activate or extend their subscription.
            </p>

            {clientsList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-2xl">
                <p className="text-sm font-bold">No clients onboarded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Please register clients in the Client Hub first.</p>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="mt-4 w-full py-2.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignPackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Select Client</span>
                    {selectedClientId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClientId('');
                          setSearchClientQuery('');
                        }}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Change
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchClientQuery}
                      onChange={(e) => {
                        setSearchClientQuery(e.target.value);
                        setSelectedClientId('');
                      }}
                      placeholder="Type client name or email..."
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-white"
                      disabled={!!selectedClientId}
                      required
                    />
                    {/* Suggestions list */}
                    {searchClientQuery && !selectedClientId && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-border/60">
                        {clientsList
                          .filter(c => 
                            c.name.toLowerCase().includes(searchClientQuery.toLowerCase()) || 
                            c.email.toLowerCase().includes(searchClientQuery.toLowerCase())
                          )
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedClientId(c.id);
                                setSearchClientQuery(`${c.name} (${c.email})`);
                              }}
                              className="px-4 py-2.5 hover:bg-primary/10 cursor-pointer text-xs transition-colors"
                            >
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="text-muted-foreground ml-1.5">({c.email})</span>
                            </div>
                          ))
                        }
                        {clientsList.filter(c => 
                          c.name.toLowerCase().includes(searchClientQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchClientQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                            No matching clients found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedClientId && (
                  <>
                    {/* Start Date Selection */}
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subscription Start Date</label>
                      <input
                        type="text"
                        value={customStartDate}
                        placeholder="yyyy-mm-dd"
                        onFocus={(e) => {
                          e.currentTarget.type = 'date';
                          try { e.currentTarget.showPicker(); } catch (err) {}
                        }}
                        onBlur={(e) => {
                      e.currentTarget.type = 'text';
                    }}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-white cursor-pointer"
                        required
                      />
                    </div>

                    {/* Auto Calculated Integration View */}
                    <div className="p-5 rounded-2xl bg-background border border-border/80 space-y-3">
                      <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary">
                        <Sparkles size={14} />
                        <span>Subscription Renewal Details</span>
                      </h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Expiry:</span>
                          <span className="font-bold text-white">
                            {clientsList.find(c => c.id === selectedClientId)?.expiryDate || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Expiry:</span>
                          <span className="font-bold text-primary">
                            {(() => {
                              const getNewExpiryDate = (startDateStr: string, durationType: string, durationValue: number): string => {
                                const baseDate = new Date(startDateStr);
                                if (isNaN(baseDate.getTime())) return 'N/A';
                                
                                const newExpiry = new Date(baseDate);
                                if (durationType === 'Daily') {
                                  newExpiry.setDate(baseDate.getDate() + durationValue);
                                } else if (durationType === 'Weekly') {
                                  newExpiry.setDate(baseDate.getDate() + (durationValue * 7));
                                } else if (durationType === 'Monthly') {
                                  newExpiry.setMonth(baseDate.getMonth() + durationValue);
                                }
                                return newExpiry.toISOString().split('T')[0];
                              };
                              return getNewExpiryDate(customStartDate, selectedPkgForAssign.durationType, selectedPkgForAssign.durationValue);
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Device limit:</span>
                          <span className="font-bold text-white">Max {selectedPkgForAssign.maxDevices}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsAssignModalOpen(false); setSelectedPkgForAssign(null); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedClientId}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Activate / Renew
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
