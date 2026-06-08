'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Users, 
  Dumbbell, 
  Utensils, 
  Sparkles, 
  CreditCard, 
  LineChart 
} from 'lucide-react';

const features = [
  {
    title: 'Client Management',
    description: 'Centralized hub for all your trainees. Track progress, check-ins, and communication in one place.',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Workout Builder',
    description: 'Create professional workout plans with our extensive library. Drag-and-drop exercises with ease.',
    icon: Dumbbell,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'AI Coaching',
    description: 'Leverage AI to generate personalized training and nutrition plans based on client goals.',
    icon: Sparkles,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Nutrition System',
    description: 'Advanced meal planning with macro tracking and food database integration.',
    icon: Utensils,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'Automated Payments',
    description: 'Set up recurring subscriptions and handle payments automatically with Stripe and Paymob.',
    icon: CreditCard,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    title: 'Deep Analytics',
    description: 'Visualize client progress and business growth with interactive charts and reports.',
    icon: LineChart,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Everything you need to <br />
            <span className="text-muted-foreground">scale your coaching business.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Stop juggling between apps. INNEXA FIT brings your entire coaching workflow into a single, 
            AI-powered operating system.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full group hover:bg-secondary/30 transition-all border-border/50">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
