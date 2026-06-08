'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

const problems = [
  'Managing clients via WhatsApp is messy and unprofessional.',
  'PDFs and Excel sheets are hard for clients to follow.',
  'Tracking progress photos and weight is a manual nightmare.',
  'Chasing payments and managing renewals takes too much time.',
];

const solutions = [
  'Centralized client portal with instant communication.',
  'Interactive, mobile-friendly workout and nutrition plans.',
  'Automated progress tracking with visual charts.',
  'Seamless automated billing and subscription management.',
];

export default function ProblemSolution() {
  return (
    <section id="solution" className="py-32 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">The Old Way</h2>
              <ul className="space-y-6">
                {problems.map((problem, i) => (
                  <li key={i} className="flex items-start space-x-4 group">
                    <div className="p-1 rounded-full bg-destructive/10 text-destructive mt-1">
                      <XCircle size={20} />
                    </div>
                    <p className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                      {problem}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20"
            >
              <p className="text-destructive font-bold italic">
                "I was spending 4 hours a day just on admin tasks, leaving little time for actual coaching."
              </p>
              <p className="text-sm text-muted-foreground mt-4">— Professional Fitness Coach</p>
            </motion.div>
          </div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 text-brand-gradient">The INNEXA FIT Way</h2>
              <ul className="space-y-6">
                {solutions.map((solution, i) => (
                  <li key={i} className="flex items-start space-x-4 group">
                    <div className="p-1 rounded-full bg-brand-blue/10 text-brand-blue mt-1">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-lg font-medium group-hover:text-foreground transition-colors">
                      {solution}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-brand-blue/5 border border-brand-blue/20"
            >
              <p className="text-brand-blue font-bold">
                "Since switching to INNEXA FIT, my client retention has increased by 40% and I save 15 hours a week."
              </p>
              <p className="text-sm text-muted-foreground mt-4">— INNEXA FIT User</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
