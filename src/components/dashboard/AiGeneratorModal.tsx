'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Check, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AiGeneratorModalProps {
  type: 'workout' | 'nutrition';
  onGenerated: (data: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiGeneratorModal({ type, onGenerated, isOpen, onClose }: AiGeneratorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: 'Muscle Gain',
    weight: 80,
    height: 180,
    experience: 'Intermediate',
    trainingDays: 4,
    calories: 2500,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'workout' ? '/ai/workout' : '/ai/nutrition';
      const response = await api.post(endpoint, formData);
      onGenerated(response.data.data);
      toast.success('Plan generated successfully!');
      onClose();
    } catch (error) {
      toast.error('AI generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-[2.5rem] p-10 z-[101] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center space-x-3 text-brand-purple">
                  <BrainCircuit size={32} />
                  <h2 className="text-2xl font-black tracking-tight">AI {type === 'workout' ? 'Workout' : 'Nutrition'} Generator</h2>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-all">
                  <X size={20} />
               </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Goal</label>
                  <select 
                    className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 outline-none"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  >
                     <option>Muscle Gain</option>
                     <option>Fat Loss</option>
                     <option>Strength</option>
                     <option>Endurance</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Experience</label>
                  <select 
                    className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 outline-none"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  >
                     <option>Beginner</option>
                     <option>Intermediate</option>
                     <option>Advanced</option>
                     <option>Professional</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Weight (kg)</label>
                  <Input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Height (cm)</label>
                  <Input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                  />
               </div>
               {type === 'workout' ? (
                 <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Training Days per Week</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="7" 
                      value={formData.trainingDays}
                      onChange={(e) => setFormData({...formData, trainingDays: Number(e.target.value)})}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                       <span>1 Day</span>
                       <span className="text-brand-purple">{formData.trainingDays} Days</span>
                       <span>7 Days</span>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Calories</label>
                    <Input 
                      type="number" 
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: Number(e.target.value)})}
                      placeholder="e.g. 2500"
                    />
                 </div>
               )}
            </div>

            <Button 
              variant="brand" 
              className="w-full h-16 text-lg rounded-[1.5rem]" 
              onClick={handleGenerate}
              disabled={loading}
            >
               {loading ? (
                 <>
                   <Loader2 className="mr-2 animate-spin" />
                   AI is thinking...
                 </>
               ) : (
                 <>
                   <Sparkles className="mr-2" />
                   Generate Professional Plan
                 </>
               )}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em] font-bold">
               Powered by GPT-4o Intelligence
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
