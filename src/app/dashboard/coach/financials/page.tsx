'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  TrendingDown, 
  Plus, 
  Briefcase,
  FileSpreadsheet,
  FileText,
  Users,
  UserMinus,
  RotateCcw,
  Utensils,
  Dumbbell,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

const earningsData = [
  { month: 'Jan', revenue: 4800, expenses: 800 },
  { month: 'Feb', revenue: 5900, expenses: 850 },
  { month: 'Mar', revenue: 7200, expenses: 900 },
  { month: 'Apr', revenue: 6800, expenses: 950 },
  { month: 'May', revenue: 10400, expenses: 1100 },
  { month: 'Jun', revenue: 12450, expenses: 1200 },
];

const profitsReport = [
  { id: 'TXN-101', trainee: 'John Doe', amount: 49.00, date: '2026-06-05', method: 'Stripe' },
  { id: 'TXN-102', trainee: 'Sarah Jenkins', amount: 29.00, date: '2026-06-03', method: 'PayPal' },
  { id: 'TXN-104', trainee: 'Emma Wilson', amount: 49.00, date: '2026-05-28', method: 'Bank Transfer' },
  { id: 'TXN-105', trainee: 'Harvey Specter', amount: 150.00, date: '2026-05-25', method: 'Stripe' },
  { id: 'TXN-106', trainee: 'Jessica Pearson', amount: 150.00, date: '2026-05-22', method: 'Stripe' },
  { id: 'TXN-107', trainee: 'Louis Litt', amount: 99.00, date: '2026-05-18', method: 'PayPal' },
];

const receivablesReport = [
  { id: 'INV-003', trainee: 'Mike Ross', amount: 99.00, date: '2026-06-02', status: 'Overdue' },
  { id: 'INV-008', trainee: 'Rachel Zane', amount: 49.00, date: '2026-06-10', status: 'Unpaid' },
  { id: 'INV-009', trainee: 'Donna Paulsen', amount: 150.00, date: '2026-06-15', status: 'Unpaid' },
  { id: 'INV-010', trainee: 'Daniel Hardman', amount: 299.00, date: '2026-06-20', status: 'Unpaid' },
];

const activeClientsReport = [
  { name: 'John Doe', email: 'john@example.com', plan: 'Premium Muscle Builder', startDate: '2026-05-01', status: 'Active' },
  { name: 'Sarah Jenkins', email: 'sarah@example.com', plan: 'Quick Fat Loss Trial', startDate: '2026-05-01', status: 'Active' },
  { name: 'Mike Ross', email: 'mike@example.com', plan: 'Strength Build Pro', startDate: '2026-05-01', status: 'Active' },
  { name: 'Emma Wilson', email: 'emma@example.com', plan: 'Quick Fat Loss Trial', startDate: '2026-05-01', status: 'Active' },
  { name: 'Harvey Specter', email: 'harvey@example.com', plan: 'CEO Elite Fit Plan', startDate: '2026-05-25', status: 'Active' },
];

const inactiveClientsReport = [
  { name: 'Peter Parker', email: 'peter@example.com', lastPlan: 'Basic Conditioning', endDate: '2026-04-15', reason: 'Subscription Expired' },
  { name: 'Clark Kent', email: 'clark@example.com', lastPlan: 'Man of Steel Protocol', endDate: '2026-03-30', reason: 'Suspended' },
  { name: 'Bruce Wayne', email: 'bruce@example.com', lastPlan: 'Dark Knight Bulk', endDate: '2026-05-10', reason: 'Cancelled by Client' },
];

const refundsReport = [
  { id: 'REF-201', trainee: 'Tony Stark', amount: 150.00, date: '2026-05-30', reason: 'Injury / Double Charge' },
  { id: 'REF-202', trainee: 'Steve Rogers', amount: 49.00, date: '2026-05-12', reason: 'Package Downgrade' },
  { id: 'REF-203', trainee: 'Natasha Romanoff', amount: 29.00, date: '2026-04-25', reason: 'Dissatisfied with Meal Options' },
];

const nutritionPlansReport = [
  { id: 'NUT-801', trainee: 'John Doe', calories: '2,400 kcal', macros: '180g P / 220g C / 65g F', date: '2026-05-01' },
  { id: 'NUT-802', trainee: 'Sarah Jenkins', calories: '1,600 kcal', macros: '130g P / 150g C / 45g F', date: '2026-05-01' },
  { id: 'NUT-803', trainee: 'Mike Ross', calories: '2,800 kcal', macros: '190g P / 300g C / 80g F', date: '2026-05-01' },
  { id: 'NUT-804', trainee: 'Emma Wilson', calories: '1,500 kcal', macros: '120g P / 130g C / 50g F', date: '2026-05-01' },
  { id: 'NUT-805', trainee: 'Harvey Specter', calories: '2,200 kcal', macros: '175g P / 200g C / 60g F', date: '2026-05-25' },
];

const trainingProgramsReport = [
  { id: 'WRK-901', trainee: 'John Doe', split: 'Push/Pull/Legs', frequency: '5 Days / Week', date: '2026-05-01' },
  { id: 'WRK-902', trainee: 'Sarah Jenkins', split: 'Full Body Recomp', frequency: '3 Days / Week', date: '2026-05-01' },
  { id: 'WRK-903', trainee: 'Mike Ross', split: 'Heavy Powerlifting', frequency: '4 Days / Week', date: '2026-05-01' },
  { id: 'WRK-904', trainee: 'Emma Wilson', split: 'Cardio & Core Slim', frequency: '4 Days / Week', date: '2026-05-01' },
  { id: 'WRK-905', trainee: 'Harvey Specter', split: 'Executive Conditioning', frequency: '3 Days / Week', date: '2026-05-25' },
];

const reportOptions = [
  { type: 'profits', label: 'Total Profits', desc: 'Earnings & net revenues', icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
  { type: 'receivables', label: 'Remaining Balance', desc: 'Outstanding receivables', icon: CreditCard, color: 'text-yellow-500 bg-yellow-500/10' },
  { type: 'active_clients', label: 'Active Trainees', desc: 'Currently active subscribers', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
  { type: 'inactive_clients', label: 'Inactive Trainees', desc: 'Expired or suspended clients', icon: UserMinus, color: 'text-zinc-500 bg-zinc-500/10' },
  { type: 'refunds', label: 'Refunds & Returns', desc: 'Processed client refunds', icon: RotateCcw, color: 'text-rose-500 bg-rose-500/10' },
  { type: 'nutrition_plans', label: 'Nutrition Plans', desc: 'Designed client diet sheets', icon: Utensils, color: 'text-orange-500 bg-orange-500/10' },
  { type: 'training_programs', label: 'Training Programs', desc: 'Designed workout sheets', icon: Dumbbell, color: 'text-purple-500 bg-purple-500/10' }
] as const;

export default function FinancialReportsPage() {
  const [reportType, setReportType] = useState<'profits' | 'receivables' | 'active_clients' | 'inactive_clients' | 'refunds' | 'nutrition_plans' | 'training_programs'>('profits');
  
  // Date period filters
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  // Filtered datasets based on selected period
  const filteredProfits = useMemo(() => {
    return profitsReport.filter(item => item.date >= startDate && item.date <= endDate);
  }, [startDate, endDate]);

  const filteredReceivables = useMemo(() => {
    return receivablesReport.filter(item => item.date >= startDate && item.date <= endDate);
  }, [startDate, endDate]);

  const filteredActiveClients = useMemo(() => {
    return activeClientsReport.filter(item => item.startDate >= startDate && item.startDate <= endDate);
  }, [startDate, endDate]);

  const filteredInactiveClients = useMemo(() => {
    return inactiveClientsReport.filter(item => item.endDate >= startDate && item.endDate <= endDate);
  }, [startDate, endDate]);

  const filteredRefunds = useMemo(() => {
    return refundsReport.filter(item => item.date >= startDate && item.date <= endDate);
  }, [startDate, endDate]);

  const filteredNutritionPlans = useMemo(() => {
    return nutritionPlansReport.filter(item => item.date >= startDate && item.date <= endDate);
  }, [startDate, endDate]);

  const filteredTrainingPrograms = useMemo(() => {
    return trainingProgramsReport.filter(item => item.date >= startDate && item.date <= endDate);
  }, [startDate, endDate]);

  // Forecasting states
  const [projectedClients, setProjectedClients] = useState(60);
  const [avgTicketPrice, setAvgTicketPrice] = useState(49);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(5); // in %

  const activeReportInfo = useMemo(() => {
    switch (reportType) {
      case 'profits':
        const totalProfits = filteredProfits.reduce((sum, item) => sum + item.amount, 0);
        return {
          title: 'Total Profits & Revenue Report',
          desc: 'Review settled payments and gross earnings history.',
          countLabel: 'Total Transactions',
          countVal: String(filteredProfits.length),
          metricLabel: 'Gross Earnings',
          metricVal: `$${totalProfits.toFixed(2)}`,
          metricColor: 'text-green-400'
        };
      case 'receivables':
        const totalReceivables = filteredReceivables.reduce((sum, item) => sum + item.amount, 0);
        return {
          title: 'Outstanding Remaining Balance Report',
          desc: 'Track invoices awaiting payment and overdue receivables.',
          countLabel: 'Pending Invoices',
          countVal: String(filteredReceivables.length),
          metricLabel: 'Total Receivables',
          metricVal: `$${totalReceivables.toFixed(2)}`,
          metricColor: 'text-yellow-400'
        };
      case 'active_clients':
        return {
          title: 'Active Trainees Report',
          desc: 'Detailed breakdown of trainees currently with active memberships.',
          countLabel: 'Active Trainees',
          countVal: String(filteredActiveClients.length),
          metricLabel: 'Monthly Run Rate',
          metricVal: `$${(filteredActiveClients.length * 49).toFixed(2)}`,
          metricColor: 'text-blue-400'
        };
      case 'inactive_clients':
        const activeCount = filteredActiveClients.length;
        const inactiveCount = filteredInactiveClients.length;
        const totalCount = activeCount + inactiveCount;
        return {
          title: 'Inactive & Suspended Trainees Report',
          desc: 'List of trainees whose memberships have expired, cancelled, or suspended.',
          countLabel: 'Inactive Trainees',
          countVal: String(inactiveCount),
          metricLabel: 'Attrition Rate',
          metricVal: totalCount > 0 ? `${((inactiveCount / totalCount) * 100).toFixed(1)}%` : '0.0%',
          metricColor: 'text-zinc-400'
        };
      case 'refunds':
        const totalRefunds = filteredRefunds.reduce((sum, item) => sum + item.amount, 0);
        return {
          title: 'Processed Refunds Report',
          desc: 'History of refunded packages, returns, and dispute chargebacks.',
          countLabel: 'Refunded Items',
          countVal: String(filteredRefunds.length),
          metricLabel: 'Total Refunded',
          metricVal: `$${totalRefunds.toFixed(2)}`,
          metricColor: 'text-rose-400'
        };
      case 'nutrition_plans':
        return {
          title: 'Nutrition Plans Report',
          desc: 'Overview of diet plans designed and assigned to trainees.',
          countLabel: 'Active Plans',
          countVal: String(filteredNutritionPlans.length),
          metricLabel: 'Avg Calorie Target',
          metricVal: '2,100 kcal',
          metricColor: 'text-orange-400'
        };
      case 'training_programs':
        return {
          title: 'Designed Workout Programs Report',
          desc: 'Overview of multi-day training splits assigned to active clients.',
          countLabel: 'Active Programs',
          countVal: String(filteredTrainingPrograms.length),
          metricLabel: 'Avg split frequency',
          metricVal: '3.8 days/wk',
          metricColor: 'text-purple-400'
        };
    }
  }, [reportType, filteredProfits, filteredReceivables, filteredActiveClients, filteredInactiveClients, filteredRefunds, filteredNutritionPlans, filteredTrainingPrograms]);

  const reportTableData = useMemo(() => {
    switch (reportType) {
      case 'profits':
        return {
          headers: ['Transaction ID', 'Trainee Name', 'Amount Paid', 'Date', 'Payment Method'],
          rows: filteredProfits.map(item => [
            item.id,
            item.trainee,
            `$${item.amount.toFixed(2)}`,
            item.date,
            item.method
          ])
        };
      case 'receivables':
        return {
          headers: ['Invoice ID', 'Trainee Name', 'Amount Due', 'Due Date', 'Status'],
          rows: filteredReceivables.map(item => [
            item.id,
            item.trainee,
            `$${item.amount.toFixed(2)}`,
            item.date,
            item.status
          ])
        };
      case 'active_clients':
        return {
          headers: ['Trainee Name', 'Email', 'Assigned Plan', 'Start Date', 'Status'],
          rows: filteredActiveClients.map(item => [
            item.name,
            item.email,
            item.plan,
            item.startDate,
            item.status
          ])
        };
      case 'inactive_clients':
        return {
          headers: ['Trainee Name', 'Email', 'Last Active Plan', 'End Date', 'Reason'],
          rows: filteredInactiveClients.map(item => [
            item.name,
            item.email,
            item.lastPlan,
            item.endDate,
            item.reason
          ])
        };
      case 'refunds':
        return {
          headers: ['Refund ID', 'Trainee Name', 'Amount Refunded', 'Refund Date', 'Reason'],
          rows: filteredRefunds.map(item => [
            item.id,
            item.trainee,
            `$${item.amount.toFixed(2)}`,
            item.date,
            item.reason
          ])
        };
      case 'nutrition_plans':
        return {
          headers: ['Plan ID', 'Trainee Name', 'Target Calories', 'Macros Split', 'Date Assigned'],
          rows: filteredNutritionPlans.map(item => [
            item.id,
            item.trainee,
            item.calories,
            item.macros,
            item.date
          ])
        };
      case 'training_programs':
        return {
          headers: ['Program ID', 'Trainee Name', 'Workout Split', 'Days/Week', 'Date Assigned'],
          rows: filteredTrainingPrograms.map(item => [
            item.id,
            item.trainee,
            item.split,
            item.frequency,
            item.date
          ])
        };
    }
  }, [reportType, filteredProfits, filteredReceivables, filteredActiveClients, filteredInactiveClients, filteredRefunds, filteredNutritionPlans, filteredTrainingPrograms]);

  const handleExportExcel = () => {
    const filename = `${reportType}-report`;
    exportToExcel(filename, reportTableData.headers, reportTableData.rows);
  };

  const handleExportPDF = () => {
    const title = activeReportInfo.title;
    const summary = [
      { label: activeReportInfo.countLabel, value: activeReportInfo.countVal },
      { label: activeReportInfo.metricLabel, value: activeReportInfo.metricVal }
    ];
    exportToPDF(title, reportTableData.headers, reportTableData.rows, summary);
  };

  const exportFullStatementPDF = () => {
    const headers = ['Month', 'Revenue', 'Expenses', 'Net Profit'];
    const rows = earningsData.map(d => [
      d.month,
      `$${d.revenue}`,
      `$${d.expenses}`,
      `$${d.revenue - d.expenses}`
    ]);
    exportToPDF('Consolidated Financial Statement', headers, rows, [
      { label: 'Net Profit (YTD)', value: '$37,550.00' },
      { label: 'Avg. Monthly Revenue', value: '$7,925.00' },
      { label: 'Total Revenue (6 Months)', value: `$${earningsData.reduce((s, d) => s + d.revenue, 0)}` },
      { label: 'Total Expenses (6 Months)', value: `$${earningsData.reduce((s, d) => s + d.expenses, 0)}` }
    ]);
  };

  // Forecasting math
  const currentMRR = projectedClients * avgTicketPrice;
  const growthMultiplier = 1 + (monthlyGrowthRate / 100);
  const m1Projected = Math.round(currentMRR * growthMultiplier);
  const m3Projected = Math.round(currentMRR * Math.pow(growthMultiplier, 3));
  const m6Projected = Math.round(currentMRR * Math.pow(growthMultiplier, 6));
  const annualForecasted = Math.round(currentMRR * 12 * Math.pow(growthMultiplier, 4)); // weighted

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground mt-2">Analyze your earnings history, track outstanding payments, and project your future growth.</p>
        </div>
        <button 
          onClick={exportFullStatementPDF}
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all sm:w-auto"
        >
          <Download size={18} />
          <span>Export Financial Statement (PDF)</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-card border border-border">
          <p className="text-xs text-muted-foreground font-bold uppercase">Net Profit (YTD)</p>
          <p className="text-3xl font-black mt-2 text-green-500">$37,550.00</p>
          <span className="text-[10px] text-muted-foreground font-bold block mt-1">After platform fees & taxes</span>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border">
          <p className="text-xs text-muted-foreground font-bold uppercase">Avg. Monthly Revenue</p>
          <p className="text-3xl font-black mt-2">$7,925.00</p>
          <span className="text-[10px] text-green-500 font-bold flex items-center mt-1">
            <ArrowUpRight size={12} className="mr-0.5" />
            +8.3% MoM Growth
          </span>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border">
          <p className="text-xs text-muted-foreground font-bold uppercase">Subscriber Lifetime Value (LTV)</p>
          <p className="text-3xl font-black mt-2 text-primary">$345.00</p>
          <span className="text-[10px] text-muted-foreground font-bold block mt-1">Average subscription duration: 7 months</span>
        </div>
      </div>

      {/* MoM Revenue Chart */}
      <div className="p-8 rounded-[2.5rem] bg-card border border-border">
        <div>
          <h2 className="text-xl font-bold">Revenue & Expenses</h2>
          <p className="text-sm text-muted-foreground mb-8">Month-over-month cash flow logs for the last 6 months</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="none" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Selector Panel */}
      <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
        <div>
          <h2 className="text-xl font-bold">Select Report Type</h2>
          <p className="text-sm text-muted-foreground">Choose a category to display detailed reports and export structured metrics.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {reportOptions.map(opt => {
            const Icon = opt.icon;
            const isActive = reportType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setReportType(opt.type)}
                type="button"
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 ${
                  isActive 
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                    : 'bg-card border-border hover:border-primary/20 text-white'
                }`}
              >
                <div className={`p-2 rounded-xl w-fit ${isActive ? 'bg-primary-foreground/20 text-white' : opt.color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 w-full mt-2">
                  <p className="text-xs font-black truncate">{opt.label}</p>
                  <p className={`text-[9px] mt-0.5 truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Forecasting & Invoices Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Income Forecasting */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Income Forecasting</h2>
            <p className="text-sm text-muted-foreground mb-6">Interactive planning based on recurring growth rate</p>
            
            <div className="space-y-6">
              {/* Sliders */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Projected Active Trainees</span>
                  <span className="text-primary">{projectedClients}</span>
                </div>
                <input 
                  type="range" min="10" max="200" value={projectedClients}
                  onChange={(e) => setProjectedClients(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Avg. Subscription Price / mo</span>
                  <span className="text-primary">${avgTicketPrice}</span>
                </div>
                <input 
                  type="range" min="10" max="200" value={avgTicketPrice}
                  onChange={(e) => setAvgTicketPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Assumed Monthly Growth Rate</span>
                  <span className="text-primary">+{monthlyGrowthRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" value={monthlyGrowthRate}
                  onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-8 space-y-4 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Monthly Revenue (MRR)</span>
                <span className="font-bold">${currentMRR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">3-Month Projected MRR</span>
                <span className="font-bold text-primary">${m3Projected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">6-Month Projected MRR</span>
                <span className="font-bold text-primary">${m6Projected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-border/50">
                <span className="font-bold">Projected Annual Profit</span>
                <span className="font-black text-green-500 text-lg">${annualForecasted.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Report Details Tracker */}
        <div className="lg:col-span-3 p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{activeReportInfo.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{activeReportInfo.desc}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all text-white animate-pulse-once"
              >
                <FileSpreadsheet size={12} className="text-emerald-500" />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary/40 text-xs font-bold transition-all text-white"
              >
                <FileText size={12} className="text-red-500" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Date Period Filter Panel */}
          <div className="p-4 rounded-2xl bg-secondary/15 border border-border flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <span className="text-xs font-bold text-white">Filter Period:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => { setStartDate('2026-05-01'); setEndDate('2026-06-30'); }}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary inside Table Section */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary/20 border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">{activeReportInfo.countLabel}</span>
              <span className="text-lg font-black text-white mt-1">{activeReportInfo.countVal}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">{activeReportInfo.metricLabel}</span>
              <span className={`text-lg font-black mt-1 ${activeReportInfo.metricColor}`}>{activeReportInfo.metricVal}</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase font-bold">
                  {reportTableData.headers.map((header, idx) => (
                    <th key={idx} className="pb-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportTableData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={reportTableData.headers.length} className="text-center py-8 text-xs text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                ) : (
                  reportTableData.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="text-sm">
                      {row.map((cell, cellIdx) => {
                        const cellStr = String(cell);
                        const isStatus = cellStr === 'Paid' || cellStr === 'Active' || cellStr === 'Overdue' || cellStr === 'Unpaid' || cellStr === 'Suspended' || cellStr === 'Subscription Expired' || cellStr === 'Cancelled by Client';
                        
                        if (isStatus) {
                          const isSuccess = cellStr === 'Paid' || cellStr === 'Active';
                          const isWarning = cellStr === 'Overdue' || cellStr === 'Unpaid';
                          return (
                            <td key={cellIdx} className="py-4">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isSuccess 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : isWarning 
                                    ? 'bg-yellow-500/10 text-yellow-400' 
                                    : 'bg-zinc-500/10 text-zinc-400'
                              }`}>
                                {cellStr}
                              </span>
                            </td>
                          );
                        }

                        const isMonospace = cellIdx === 0 && (cellStr.startsWith('TXN') || cellStr.startsWith('INV') || cellStr.startsWith('REF') || cellStr.startsWith('NUT') || cellStr.startsWith('WRK'));
                        return (
                          <td 
                            key={cellIdx} 
                            className={`py-4 ${isMonospace ? 'font-mono text-xs text-muted-foreground' : 'font-semibold text-white'}`}
                          >
                            {cellStr}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
