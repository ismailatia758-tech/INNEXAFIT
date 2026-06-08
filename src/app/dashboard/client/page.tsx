'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Droplet, 
  Flame, 
  Dumbbell, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Smartphone,
  ChevronRight,
  Plus,
  Minus,
  Paperclip,
  FileText,
  File
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  
  // State for biometrics and trackers
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [weight, setWeight] = useState(78.5);
  const [weightInput, setWeightInput] = useState('');
  const [mealsChecked, setMealsChecked] = useState<boolean[]>([false, false, false, false]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  
  // State for attachments
  const [attachments, setAttachments] = useState<any[]>([]);
  const [viewingAttachment, setViewingAttachment] = useState<any>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedWater = localStorage.getItem(`clientWater_${todayStr}`);
    if (savedWater) setWaterGlasses(Number(savedWater));

    const savedWeight = localStorage.getItem('clientWeightLogs');
    if (savedWeight) {
      const parsed = JSON.parse(savedWeight);
      if (parsed.length > 0) setWeight(parsed[parsed.length - 1].value);
    }

    const savedMeals = localStorage.getItem(`clientMeals_${todayStr}`);
    if (savedMeals) setMealsChecked(JSON.parse(savedMeals));

    // Get active subscription packages and user info
    const savedPackages = localStorage.getItem('subscriptionPackages');
    const packages = savedPackages ? JSON.parse(savedPackages) : [];
    if (packages.length > 0) {
      // Assign the first package as mock active subscription
      setActiveSubscription(packages[0]);
    }

    // Load coach attachments for this client
    if (user?.email) {
      const savedClients = localStorage.getItem('coachClients');
      const clientsList = savedClients ? JSON.parse(savedClients) : [];
      const matched = clientsList.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase()) || {
        id: 'cli-1',
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const savedAtts = localStorage.getItem('clientAttachments');
      let attList: any[] = [];
      if (savedAtts) {
        attList = JSON.parse(savedAtts);
      } else {
        attList = [];
        localStorage.setItem('clientAttachments', JSON.stringify(attList));
      }
      setAttachments(attList.filter((att: any) => att.clientId === matched.id));
    }
  }, [user]);

  // Update water in localStorage
  const handleWaterChange = (amount: number) => {
    const newGlasses = Math.max(0, waterGlasses + amount);
    setWaterGlasses(newGlasses);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`clientWater_${todayStr}`, String(newGlasses));
  };

  // Log new weight
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;
    
    setWeight(val);
    const todayStr = new Date().toISOString().split('T')[0];
    const savedWeight = localStorage.getItem('clientWeightLogs');
    const logs = savedWeight ? JSON.parse(savedWeight) : [];
    logs.push({ date: todayStr, value: val });
    localStorage.setItem('clientWeightLogs', JSON.stringify(logs));
    setWeightInput('');
  };

  // Check off meals
  const handleToggleMeal = (index: number) => {
    const updated = [...mealsChecked];
    updated[index] = !updated[index];
    setMealsChecked(updated);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`clientMeals_${todayStr}`, JSON.stringify(updated));
  };

  const caloriesMax = 2300;
  const breakfastCals = 550;
  const lunchCals = 750;
  const dinnerCals = 650;
  const snackCals = 350;

  const currentCals = 
    (mealsChecked[0] ? breakfastCals : 0) +
    (mealsChecked[1] ? lunchCals : 0) +
    (mealsChecked[2] ? dinnerCals : 0) +
    (mealsChecked[3] ? snackCals : 0);

  // Dynamic status details of Coach (Online, Busy, Offline)
  const coachStatus = 'online';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>Welcome back, {user?.name || 'Athlete'}</span>
            <Sparkles size={24} className="text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">Let's check in on your targets and complete your daily goals.</p>
        </div>
        
        {/* Next Checkin Indicator */}
        <div className="px-4 py-2 rounded-xl bg-card border border-border flex items-center gap-2 text-xs font-bold">
          <Calendar size={16} className="text-primary" />
          <span>Weekly Check-in: <span className="text-green-500">DUE TODAY</span></span>
        </div>
      </div>

      {/* Check-in Banner Prompts */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/5 to-card border border-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-1">
          <h3 className="font-bold text-base">Time for your weekly report!</h3>
          <p className="text-xs text-muted-foreground">Keep your coach updated with your latest measurements, weight logs, and progress photos.</p>
        </div>
        <Link href="/dashboard/client/checkins/new">
          <button className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-xs font-bold hover:bg-primary/95 transition-all shadow-md">
            <span>Start Weekly Check-in</span>
            <ChevronRight size={14} />
          </button>
        </Link>
      </motion.div>

      {/* Grid of Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Tracker Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water Tracker Card */}
            <div className="p-6 rounded-[2rem] bg-card border border-border flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Droplet size={20} className="fill-blue-500/20" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Water Tracker</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Target: 10 Glasses (2.5L)</p>
                  </div>
                </div>
                <span className="text-lg font-black text-blue-500">{waterGlasses} / 10</span>
              </div>

              {/* Progress visual */}
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border/20">
                <motion.div 
                  className="bg-blue-500 h-full rounded-full"
                  animate={{ width: `${Math.min(100, (waterGlasses / 10) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleWaterChange(-1)}
                  disabled={waterGlasses === 0}
                  className="flex-1 flex items-center justify-center space-x-1 py-3 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  <Minus size={14} />
                  <span>Glass</span>
                </button>
                <button
                  onClick={() => handleWaterChange(1)}
                  className="flex-1 flex items-center justify-center space-x-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Plus size={14} />
                  <span>Add Glass</span>
                </button>
              </div>
            </div>

            {/* Weight Logger Card */}
            <div className="p-6 rounded-[2rem] bg-card border border-border flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Weight Tracker</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Last Logged Weight</p>
                  </div>
                </div>
                <span className="text-lg font-black text-purple-500">{weight.toFixed(1)} kg</span>
              </div>

              <form onSubmit={handleLogWeight} className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  placeholder="e.g. 78.2"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all"
                >
                  Log Weight
                </button>
              </form>

              <div className="text-[10px] text-muted-foreground flex justify-between">
                <span>Weekly trend: Down -0.7 kg</span>
                <span>Updated today</span>
              </div>
            </div>

          </div>

          {/* Calorie Macro meal helper checklist */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <Flame size={20} className="fill-orange-500/20" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Nutrition & Calorie Counter</h3>
                  <p className="text-xs text-muted-foreground">Check off meals consumed to track calorie logs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">{currentCals} / {caloriesMax} kcal</p>
                <p className="text-[10px] text-muted-foreground">Macro split: 30% Pro / 40% Carb / 30% Fat</p>
              </div>
            </div>

            {/* Calorie bar */}
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border/20">
              <motion.div 
                className="bg-orange-500 h-full rounded-full"
                animate={{ width: `${Math.min(100, (currentCals / caloriesMax) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Interactive Meal List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Breakfast', cals: breakfastCals, items: 'Oats, whey protein, banana, peanut butter' },
                { name: 'Lunch', cals: lunchCals, items: 'Grilled chicken breast, jasmine rice, broccoli' },
                { name: 'Dinner', cals: dinnerCals, items: 'Baked salmon fillet, sweet potatoes, green salad' },
                { name: 'Snacks/Post-Workout', cals: snackCals, items: 'Greek yogurt, mixed berries, almonds' }
              ].map((meal, idx) => (
                <button
                  key={idx}
                  onClick={() => handleToggleMeal(idx)}
                  className={`p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${
                    mealsChecked[idx] 
                      ? 'bg-orange-500/5 border-orange-500/20' 
                      : 'bg-background hover:bg-secondary/40 border-border'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs">{meal.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{meal.items}</p>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-xs font-black text-orange-500">{meal.cals} kcal</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      mealsChecked[idx] 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-border'
                    }`}>
                      {mealsChecked[idx] && <CheckCircle2 size={12} className="stroke-[3]" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Workout Quick Preview */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Today's Training Program</h3>
                  <p className="text-xs text-muted-foreground">Session: Day 3 - Push Day (Chest/Triceps)</p>
                </div>
              </div>
              
              <Link href="/dashboard/client/workout">
                <button className="flex items-center gap-1 text-xs text-primary font-bold hover:underline">
                  <span>Log Workout</span>
                  <ChevronRight size={14} />
                </button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border/80 divide-y divide-border/60">
              <div className="pb-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">1. Flat Barbell Bench Press</span>
                <span className="text-muted-foreground">4 Sets × 8 Reps (Target: 80 kg)</span>
              </div>
              <div className="py-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">2. Incline Dumbbell Chest Press</span>
                <span className="text-muted-foreground">3 Sets × 10 Reps (Target: 26 kg)</span>
              </div>
              <div className="py-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">3. Standing Overhead Dumbbell Press</span>
                <span className="text-muted-foreground">3 Sets × 12 Reps (Target: 18 kg)</span>
              </div>
              <div className="pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">4. Cable Rope Triceps Pushdown</span>
                <span className="text-muted-foreground">4 Sets × 12 Reps (Target: 22 kg)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Coach Widget & Subscription Info */}
        <div className="space-y-8">
          
          {/* Active Subscription Details */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">My Subscription</h3>
            
            {activeSubscription ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xl font-black text-foreground">{activeSubscription.name}</p>
                  <p className="text-xs text-primary font-bold mt-1">Active - 32 Days Remaining</p>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-background border border-border/60 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device Rules:</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Smartphone size={12} className="text-primary" />
                      Max {activeSubscription.maxDevices} Devices
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Rate:</span>
                    <span className="font-bold text-foreground">EGP {activeSubscription.price}/{activeSubscription.durationValue} {activeSubscription.durationType === 'Monthly' ? 'Mo' : activeSubscription.durationType === 'Weekly' ? 'Wk' : 'Day'}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-2">
                    <span className="text-muted-foreground">Next Billing:</span>
                    <span className="font-bold text-foreground">2026-07-09</span>
                  </div>
                </div>

                <Link href="/dashboard/client/billing">
                  <button className="w-full py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all">
                    Manage Billing & Devices
                  </button>
                </Link>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border rounded-2xl text-center py-6">
                <p className="text-xs font-bold">No package linked</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Contact your coach to register your subscription package.</p>
              </div>
            )}
          </div>

          {/* Coach Contact Widget */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">My Coach</h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-black relative">
                C
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Coach Innexa</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Online & Available</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border/60 text-xs text-muted-foreground italic">
              "Remember to hydrate and take proper 90-second rests between your working sets today!"
            </div>

            <Link href="/dashboard/client/chat">
              <button className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 rounded-xl text-xs font-bold hover:bg-primary/95 transition-all shadow-md">
                <MessageSquare size={14} />
                <span>Message Coach</span>
              </button>
            </Link>
          </div>

          {/* Latest Attachments Widget */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Latest Attachments</h3>
             </div>
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {attachments.length === 0 ? (
                   <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-background/20">
                      <Paperclip size={24} className="mx-auto text-muted-foreground opacity-50 mb-2 -rotate-45" />
                      <p className="text-xs font-bold text-muted-foreground">No Attachments Shared</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Your coach hasn't uploaded files yet.</p>
                   </div>
                ) : (
                   attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 rounded-[1.25rem] bg-zinc-900/40 border border-zinc-800/80 group hover:border-zinc-700/80 transition-all">
                         <div 
                            onClick={() => setViewingAttachment(file)}
                            className="flex items-center space-x-4 flex-1 cursor-pointer min-w-0"
                         >
                            <div className="w-12 h-12 rounded-xl bg-black/60 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors flex-shrink-0">
                               <Paperclip size={18} className="-rotate-45" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-bold text-white tracking-wide truncate pr-2">{file.name}</p>
                               <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mt-1">{file.size} • {file.date}</p>
                            </div>
                         </div>
                         <div className="flex items-center space-x-1">
                            <button 
                               className="p-2 text-zinc-400 hover:text-white transition-colors"
                               onClick={() => setViewingAttachment(file)}
                               title="Open File"
                            >
                               <FileText size={18} className="stroke-[1.75]" />
                            </button>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>

        </div>

      </div>
      {/* Lightbox / Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/20">
              <div>
                <h3 className="font-bold text-lg text-white truncate max-w-md">{viewingAttachment.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase">{viewingAttachment.size} • {viewingAttachment.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={viewingAttachment.url} 
                  download={viewingAttachment.name}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download File
                </a>
                <button
                  onClick={() => setViewingAttachment(null)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto bg-background/50 flex items-center justify-center min-h-[300px]">
              {viewingAttachment.fileType === 'image' ? (
                <img 
                  src={viewingAttachment.url} 
                  alt={viewingAttachment.name} 
                  className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-border/40 shadow-lg"
                />
              ) : viewingAttachment.fileType === 'pdf' ? (
                <iframe 
                  src={viewingAttachment.url} 
                  title={viewingAttachment.name}
                  className="w-full h-[60vh] rounded-2xl border border-border/40 bg-white"
                />
              ) : (
                <div className="text-center py-12">
                  <File size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="font-bold text-sm">Cannot preview this file type inside the browser</p>
                  <p className="text-xs text-muted-foreground mt-1">Please download the file using the button above to view it.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
