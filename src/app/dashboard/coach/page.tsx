'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserMinus,
  AlertCircle,
  TrendingDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';

const stats = [
  { label: 'Total Earnings', value: '$12,450', icon: DollarSign, color: 'text-green-500', trend: '+12%', isPositive: true },
  { label: 'Active Subscribers', value: '42', icon: UserCheck, color: 'text-blue-500', trend: '+4%', isPositive: true },
  { label: 'Inactive Subscribers', value: '8', icon: UserMinus, color: 'text-muted-foreground', trend: '-1', isPositive: false },
  { label: 'Outstanding Payments', value: '$450', icon: AlertCircle, color: 'text-destructive', trend: '+15%', isPositive: false },
];

const revenueData = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1500 },
  { name: 'Mar', value: 1800 },
  { name: 'Apr', value: 1400 },
  { name: 'May', value: 12450 },
];

export default function CoachDashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Coach! Here's your business at a glance.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium bg-secondary/50 px-4 py-2 rounded-xl border border-border">
          <Calendar size={16} />
          <span>June 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-background border border-border ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${
                stat.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Automated Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-[2.5rem] bg-card border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Automated Insights
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time system insights requiring your attention</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-destructive px-2 py-0.5 rounded-full bg-destructive/10">Weight Alert</span>
              <p className="font-bold mt-2 text-sm">John Doe's weight dropped 3.2kg</p>
              <p className="text-xs text-muted-foreground mt-1">This is a sharp decline. Consider checking nutrition logs or chatting.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <Link href="/dashboard/coach/chat" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <MessageSquare size={12} />
                <span>Chat Now</span>
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-yellow-500 px-2 py-0.5 rounded-full bg-yellow-500/10">Pending Onboarding</span>
              <p className="font-bold mt-2 text-sm">2 Trainees awaiting workouts</p>
              <p className="text-xs text-muted-foreground mt-1">New trainees completed signup. Create and assign their starting programs.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <Link href="/dashboard/coach/workouts/new" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <Activity size={12} />
                <span>Build Program</span>
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10">Payment Pending</span>
              <p className="font-bold mt-2 text-sm">Mike Ross subscription invoice</p>
              <p className="text-xs text-muted-foreground mt-1">The monthly payment of $99.00 has been outstanding for 2 days.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <Link href="/dashboard/coach/payments" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <DollarSign size={12} />
                <span>Review Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold">Revenue Analytics</h2>
              <p className="text-sm text-muted-foreground">Monthly revenue growth for 2026</p>
            </div>
            <select className="bg-secondary border border-border rounded-lg px-3 py-1 text-xs font-bold outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#9333ea" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col">
          <h2 className="text-xl font-bold mb-8">Latest Activity</h2>
          <div className="space-y-6 flex-1">
            {[
              { user: 'John Doe', action: 'Uploaded progress photo', time: '12m ago', icon: Activity, color: 'text-blue-500' },
              { user: 'Sarah J.', action: 'Started new workout plan', time: '1h ago', icon: Activity, color: 'text-green-500' },
              { user: 'Mike Ross', action: 'Subscription renewed', time: '3h ago', icon: DollarSign, color: 'text-yellow-500' },
              { user: 'Emma W.', action: 'Commented on meal plan', time: '5h ago', icon: Users, color: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4 group cursor-pointer">
                <div className={`p-2 rounded-xl bg-background border border-border group-hover:border-primary/20 transition-all ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.user}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.action}</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 transition-all">
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
