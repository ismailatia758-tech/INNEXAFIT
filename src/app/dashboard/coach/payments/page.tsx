'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Download,
  Filter
} from 'lucide-react';

const transactions = [
  { id: '1', client: 'John Doe', amount: '$49.00', date: '2026-05-10', status: 'Completed' },
  { id: '2', client: 'Sarah Jenkins', amount: '$29.00', date: '2026-05-08', status: 'Completed' },
  { id: '3', client: 'Mike Ross', amount: '$99.00', date: '2026-05-05', status: 'Pending' },
  { id: '4', client: 'Emma Wilson', amount: '$49.00', date: '2026-05-01', status: 'Completed' },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Revenue</h1>
        <p className="text-muted-foreground mt-2">Track your earnings and manage client subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-green-500 flex items-center">
              <ArrowUpRight size={14} className="mr-1" />
              +12%
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">$12,450.00</p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-bold text-blue-500 flex items-center">
              <ArrowUpRight size={14} className="mr-1" />
              +5%
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-1">42</p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Download size={24} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Pending Payouts</p>
          <p className="text-3xl font-bold mt-1">$850.00</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="pb-4 font-medium">Client</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {tx.client[0]}
                      </div>
                      <span className="font-bold">{tx.client}</span>
                    </div>
                  </td>
                  <td className="py-4 font-medium">{tx.amount}</td>
                  <td className="py-4 text-sm text-muted-foreground">{tx.date}</td>
                  <td className="py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-sm text-primary font-bold hover:underline">View Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
