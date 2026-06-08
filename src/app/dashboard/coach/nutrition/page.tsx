'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Users, Calendar, Flame } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  meals: any[];
  client?: {
    user: { name: string };
  };
  createdAt: string;
}

export default function NutritionListPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/nutrition');
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
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Plans</h1>
          <p className="text-muted-foreground mt-2">Manage diet plans and nutritional goals for your clients.</p>
        </div>
        <Link
          href="/dashboard/coach/nutrition/new"
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
          <span>New Diet Plan</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-card animate-pulse border border-border" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-card border border-dashed border-border">
            <Utensils className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-lg font-bold">No meal plans found</p>
            <p className="text-muted-foreground">Start by creating your first personalized diet program.</p>
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
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <Utensils size={24} />
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
                  <Flame size={16} className="mr-2 text-orange-500" />
                  {plan.meals.length} Meals
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
                  View
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
