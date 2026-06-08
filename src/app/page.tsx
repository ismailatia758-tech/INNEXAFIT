'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProblemSolution from '@/components/landing/ProblemSolution';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <Features />
        
        {/* Dashboard Preview Section (Visual Separator) */}
        <section className="py-20 bg-secondary/30 relative">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-8">Ready to transform your coaching?</h2>
              <div className="p-1 rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-border overflow-hidden shadow-2xl">
                 <div className="bg-background/80 backdrop-blur-sm p-12 flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground italic">"INNEXA FIT is the only platform that understands the actual daily struggles of a coach."</p>
                 </div>
              </div>
           </div>
        </section>

        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
