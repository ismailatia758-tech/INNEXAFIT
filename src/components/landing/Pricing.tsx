'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge: string;
  theme: 'purple' | 'blue' | 'emerald' | 'gray';
}

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    const savedPlans = localStorage.getItem('platformPricingPlans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (err) {
        setPlans([]);
      }
    } else {
      // Fallback defaults
      const defaultPlans: PricingPlan[] = [
        {
          id: 'monthly',
          name: 'Monthly License',
          price: 49,
          period: 'mo',
          description: 'Full access to all client management and workout systems on a monthly rolling license.',
          features: [
            'Unlimited client onboarding slots',
            'Professional Workout & Nutrition Library',
            'AI workout plan generator access',
            'Secure billing slots for trainee packages',
            'Priority customer support'
          ],
          cta: 'Subscribe Monthly',
          popular: false,
          badge: '',
          theme: 'purple'
        },
        {
          id: 'yearly',
          name: 'Yearly License',
          price: 399,
          period: 'yr',
          description: 'Get all professional coaching privileges for a full year at a discounted rate.',
          features: [
            'Everything in the Monthly plan',
            'Save up to 30% compared to monthly rolling',
            'Dedicated server processing bandwidth',
            'Advanced visual metrics analytics reporting',
            '24/7 priority developer support access'
          ],
          cta: 'Subscribe Yearly',
          popular: true,
          badge: 'Best Value',
          theme: 'blue'
        }
      ];
      setPlans(defaultPlans);
      localStorage.setItem('platformPricingPlans', JSON.stringify(defaultPlans));
    }
  }, []);

  const getThemeStyles = (theme: string, popular: boolean) => {
    switch (theme) {
      case 'purple':
        return popular 
          ? 'bg-secondary/40 border-brand-purple/50 shadow-[0_0_50px_rgba(147,51,234,0.1)]' 
          : 'bg-card border-border hover:border-brand-purple/20';
      case 'blue':
        return popular 
          ? 'bg-secondary/40 border-brand-blue/50 shadow-[0_0_50px_rgba(59,130,246,0.15)]' 
          : 'bg-card border-border hover:border-brand-blue/20';
      case 'emerald':
        return popular 
          ? 'bg-secondary/40 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.15)]' 
          : 'bg-card border-border hover:border-emerald-500/20';
      case 'gray':
      default:
        return popular 
          ? 'bg-secondary/40 border-primary/50 shadow-[0_0_50px_rgba(255,255,255,0.05)]' 
          : 'bg-card border-border hover:border-primary/10';
    }
  };

  const getThemeBadgeStyles = (theme: string) => {
    switch (theme) {
      case 'purple':
        return 'from-brand-purple to-brand-blue';
      case 'blue':
        return 'from-brand-blue to-cyan-500';
      case 'emerald':
        return 'from-emerald-500 to-teal-600';
      case 'gray':
      default:
        return 'from-neutral-700 to-neutral-600';
    }
  };

  const getFeatureIconStyles = (theme: string, popular: boolean) => {
    if (!popular) return 'bg-secondary text-muted-foreground';
    switch (theme) {
      case 'purple':
        return 'bg-brand-purple/20 text-brand-purple';
      case 'blue':
        return 'bg-brand-blue/20 text-brand-blue';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-500';
      case 'gray':
      default:
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Simple, Transparent <span className="text-brand-gradient">Pricing.</span>
          </motion.h2>
          <p className="text-lg text-muted-foreground">Select a platform licensing tier to launch your online coaching business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border flex flex-col justify-between ${getThemeStyles(plan.theme, plan.popular)} transition-all`}
            >
              {plan.popular && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r ${getThemeBadgeStyles(plan.theme)} text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider`}>
                  {plan.badge || 'Best Value'}
                </div>
              )}

              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-extrabold">EGP {plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-sm">
                      <div className={`p-1 rounded-full ${getFeatureIconStyles(plan.theme, plan.popular)}`}>
                        <Check size={14} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={`/register?plan=${plan.name}`} className="w-full">
                <Button 
                  variant={plan.popular ? 'brand' : 'outline'} 
                  className="w-full h-12 rounded-2xl"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
