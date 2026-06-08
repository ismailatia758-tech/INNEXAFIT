'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How many clients can I manage?',
    answer: 'It depends on your plan. The Starter plan allows up to 10 clients, while the Elite plan offers unlimited client capacity.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial on all plans. No credit card is required to start.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Absolutely. You can cancel or change your plan at any time from your dashboard settings.',
  },
  {
    question: 'Does the AI generation actually work?',
    answer: 'Yes, our AI models are trained on thousands of professional workout and nutrition data points to provide safe and effective starting points.',
  },
  {
    question: 'Is my client data secure?',
    answer: 'Security is our top priority. All data is encrypted and stored in secure cloud environments. We are fully GDPR and CCPA compliant.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-secondary/10">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-3xl border border-border bg-card overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-8 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
