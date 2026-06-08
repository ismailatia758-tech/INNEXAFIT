'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Dumbbell, Users, Calendar } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: any[];
  client?: {
    user: { name: string };
  };
  createdAt: string;
}

export default function WorkoutsListPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/workouts');
        setPlans(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground mt-2">Create and manage training programs for your clients.</p>
        </div>
        <Link
          href="/dashboard/coach/workouts/new"
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
          <span>New Plan</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-card animate-pulse border border-border" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-card border border-dashed border-border">
            <Dumbbell className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-lg font-bold">No plans found</p>
            <p className="text-muted-foreground">Get started by creating your first workout program.</p>
          </div>
        ) : (
          plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-card border border-border hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Dumbbell size={24} />
                </div>
                {plan.client && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                    Assigned
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{plan.description || 'No description provided.'}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar size={16} className="mr-2" />
                  {new Date(plan.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users size={16} className="mr-2" />
                  {plan.client?.user.name || 'Unassigned'}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-bold">
                  Edit
                </button>
                <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold">
                  Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
