'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Weight, 
  Smile, 
  Ruler, 
  Send, 
  ChevronLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const moodOptions = [
  { emoji: '🤩', label: 'Great', value: 'GREAT' },
  { emoji: '😊', label: 'Good', value: 'GOOD' },
  { emoji: '😐', label: 'Average', value: 'AVERAGE' },
  { emoji: '😔', label: 'Tired', value: 'TIRED' },
  { emoji: '😫', label: 'Stressed', value: 'STRESSED' },
];

export default function ClientCheckInPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    mood: 'GOOD',
    chest: '',
    waist: '',
    hips: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients/checkins', {
        ...formData,
        weight: Number(formData.weight),
        measurements: {
          chest: Number(formData.chest),
          waist: Number(formData.waist),
          hips: Number(formData.hips),
        }
      });
      toast.success('Check-in submitted! Your coach will be notified.');
    } catch (error) {
      toast.error('Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center space-x-4">
         <Link href="/dashboard/client" className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all">
           <ChevronLeft size={24} />
         </Link>
         <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Check-in</h1>
            <p className="text-sm text-muted-foreground">Keep your coach updated on your progress.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Biometrics */}
          <section className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
             <h2 className="text-lg font-bold flex items-center">
                <Weight size={20} className="mr-2 text-brand-purple" />
                Current Stats
             </h2>
             <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Weight (kg)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  required
                />
             </div>
             
             <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                   <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Chest (cm)</label>
                   <Input 
                    type="number" 
                    placeholder="0"
                    value={formData.chest}
                    onChange={(e) => setFormData({...formData, chest: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Waist (cm)</label>
                   <Input 
                    type="number" 
                    placeholder="0"
                    value={formData.waist}
                    onChange={(e) => setFormData({...formData, waist: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Hips (cm)</label>
                   <Input 
                    type="number" 
                    placeholder="0"
                    value={formData.hips}
                    onChange={(e) => setFormData({...formData, hips: e.target.value})}
                   />
                </div>
             </div>
          </section>

          {/* Mood & Well-being */}
          <section className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
             <h2 className="text-lg font-bold flex items-center">
                <Smile size={20} className="mr-2 text-brand-blue" />
                Well-being
             </h2>
             <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-4 block">How are you feeling?</label>
                <div className="flex justify-between">
                   {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({...formData, mood: option.value})}
                        className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all ${
                          formData.mood === option.value 
                            ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                            : 'hover:bg-secondary text-2xl'
                        }`}
                      >
                         <span className="text-2xl">{option.emoji}</span>
                         <span className="text-[10px] font-bold uppercase">{option.label}</span>
                      </button>
                   ))}
                </div>
             </div>
          </section>
        </div>

        {/* Photos */}
        <section className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
           <h2 className="text-lg font-bold flex items-center">
              <Camera size={20} className="mr-2 text-yellow-500" />
              Progress Photos
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Front', 'Side', 'Back'].map((pos) => (
                 <div key={pos} className="aspect-[3/4] rounded-3xl bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center justify-center space-y-3 group hover:border-primary/50 transition-all cursor-pointer">
                    <div className="p-4 rounded-full bg-background border border-border text-muted-foreground group-hover:text-primary transition-colors">
                       <ImageIcon size={32} />
                    </div>
                    <span className="font-bold text-sm text-muted-foreground">{pos} View</span>
                 </div>
              ))}
           </div>
        </section>

        {/* Notes */}
        <section className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
           <h2 className="text-lg font-bold">Any comments for your coach?</h2>
           <textarea 
            placeholder="I struggled with my water intake this week, but kept my workouts consistent..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full h-40 bg-secondary/30 border border-border rounded-2xl p-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
           />
        </section>

        <div className="flex justify-end">
           <Button type="submit" size="lg" className="h-16 px-12 text-lg rounded-2xl" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
              Submit Weekly Check-in
           </Button>
        </div>
      </form>
    </div>
  );
}
