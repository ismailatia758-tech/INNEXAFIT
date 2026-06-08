'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft,
  Utensils,
  Clock,
  Flame,
  Zap,
  Leaf,
  Droplets,
  Sparkles,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Globe,
  PlusCircle,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Food {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
  alternatives: string; // بدائل الأكل
}

interface NutritionDay {
  id: string;
  dayName: string; // Day 1
  sessionTitle: string; // e.g. "Low Carb Day"
  meals: Meal[];
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function NutritionBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Editor, Step 2: Distribution
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  
  // Multi-day nutrition structure
  const [days, setDays] = useState<NutritionDay[]>([
    { 
      id: 'day-1', 
      dayName: 'Day 1', 
      sessionTitle: 'High Carb / Training Day', 
      meals: [
        { id: 'm-1', name: 'Breakfast', time: '08:00 AM', foods: [], alternatives: 'Substitute oats with 80g sweet potato if needed.' }
      ] 
    }
  ]);
  const [activeDayId, setActiveDayId] = useState('day-1');

  // Distribution states
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Load clients
  useEffect(() => {
    const savedClients = localStorage.getItem('coachClients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Real-time macros calculations for active day
  const activeDay = days.find(d => d.id === activeDayId) || days[0];

  const activeDayTotals = useMemo(() => {
    return activeDay.meals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += Number(food.calories) || 0;
        acc.protein += Number(food.protein) || 0;
        acc.carbs += Number(food.carbs) || 0;
        acc.fats += Number(food.fats) || 0;
      });
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [activeDay]);

  const addDay = () => {
    const nextNum = days.length + 1;
    const newDayId = `day-${Math.random().toString(36).substr(2, 9)}`;
    const newDay: NutritionDay = {
      id: newDayId,
      dayName: `Day ${nextNum}`,
      sessionTitle: `Diet Plan Day ${nextNum}`,
      meals: [
        { id: `m-${Math.random().toString(36).substr(2, 9)}`, name: 'Breakfast', time: '08:00 AM', foods: [], alternatives: '' }
      ]
    };
    setDays([...days, newDay]);
    setActiveDayId(newDayId);
    toast.success(`Day ${nextNum} added to diet plan!`);
  };

  const removeDay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (days.length === 1) {
      toast.error('Your diet plan must contain at least one day.');
      return;
    }
    if (confirm('Are you sure you want to delete this diet day?')) {
      const updated = days.filter(d => d.id !== id);
      setDays(updated);
      if (activeDayId === id) {
        setActiveDayId(updated[0].id);
      }
      toast.success('Day removed');
    }
  };

  const updateDayTitle = (id: string, field: 'dayName' | 'sessionTitle', value: string) => {
    setDays(days.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addMealToActiveDay = () => {
    const nextMealNum = activeDay.meals.length + 1;
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Meal ${nextMealNum}`,
      time: '12:00 PM',
      foods: [],
      alternatives: ''
    };

    setDays(days.map(d => 
      d.id === activeDayId 
        ? { ...d, meals: [...d.meals, newMeal] }
        : d
    ));
  };

  const removeMealFromActiveDay = (mealId: string) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        meals: d.meals.filter(m => m.id !== mealId)
      };
    }));
  };

  const updateMealInActiveDay = (mealId: string, field: keyof Meal, value: any) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        meals: d.meals.map(m => m.id === mealId ? { ...m, [field]: value } : m)
      };
    }));
  };

  const addFoodToMeal = (mealId: string) => {
    const newFood: Food = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Food Item',
      amount: '100g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };

    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        meals: d.meals.map(m => 
          m.id === mealId ? { ...m, foods: [...m.foods, newFood] } : m
        )
      };
    }));
  };

  const updateFoodInMeal = (mealId: string, foodId: string, field: keyof Food, value: any) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        meals: d.meals.map(m => {
          if (m.id !== mealId) return m;
          return {
            ...m,
            foods: m.foods.map(f => f.id === foodId ? { ...f, [field]: value } : f)
          };
        })
      };
    }));
  };

  const removeFoodFromMeal = (mealId: string, foodId: string) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        meals: d.meals.map(m => {
          if (m.id !== mealId) return m;
          return {
            ...m,
            foods: m.foods.filter(f => f.id !== foodId)
          };
        })
      };
    }));
  };

  const handleToggleSelectClient = (email: string) => {
    if (selectedClientEmails.includes(email)) {
      setSelectedClientEmails(selectedClientEmails.filter(e => e !== email));
    } else {
      setSelectedClientEmails([...selectedClientEmails, email]);
    }
  };

  const handleSelectAllClients = () => {
    if (selectedClientEmails.length === clients.length) {
      setSelectedClientEmails([]);
    } else {
      setSelectedClientEmails(clients.map(c => c.email));
    }
  };

  const handlePublishAndDistribute = () => {
    if (!planName) return toast.error('Please enter a plan name');
    if (days.every(d => d.meals.length === 0)) {
      return toast.error('Please add at least one meal to your diet plan');
    }
    if (selectedClientEmails.length === 0) return toast.error('Please select at least one client');
    if (!scheduleStartDate) return toast.error('Please select a schedule start date');

    setLoading(true);

    setTimeout(() => {
      // 1. Save general plan to platform diets database mock
      const savedPlans = localStorage.getItem('platformDietPlans') || '[]';
      const allPlans = JSON.parse(savedPlans);
      
      const newPlan = {
        id: 'diet-' + Math.random().toString(36).substr(2, 9),
        name: planName,
        description,
        days: days.map(d => ({
          dayName: d.dayName,
          sessionTitle: d.sessionTitle,
          mealsCount: d.meals.length
        })),
        targets: selectedClientEmails,
        scheduleStartDate,
        createdAt: new Date().toISOString()
      };

      allPlans.push(newPlan);
      localStorage.setItem('platformDietPlans', JSON.stringify(allPlans));

      // 2. Distribute: push to each target client's active diets feed in localStorage
      const activeDietsStr = localStorage.getItem('clientActiveDiets') || '{}';
      const activeDiets = JSON.parse(activeDietsStr);

      selectedClientEmails.forEach(clientEmail => {
        const clientDietDays = days.map((day, idx) => {
          const assignedDate = new Date(scheduleStartDate);
          assignedDate.setDate(assignedDate.getDate() + idx);
          const assignedDateStr = assignedDate.toISOString().split('T')[0];

          return {
            id: `${newPlan.id}-${day.id}`,
            dayName: day.dayName,
            sessionTitle: day.sessionTitle,
            dateAssigned: assignedDateStr,
            isCompleted: false,
            clientFeedbackNotes: '',
            meals: day.meals.map(m => ({
              id: m.id,
              name: m.name,
              time: m.time,
              alternatives: m.alternatives,
              isCompleted: false,
              foods: m.foods.map(f => ({
                id: f.id,
                name: f.name,
                amount: f.amount,
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fats: f.fats
              }))
            }))
          };
        });

        if (!activeDiets[clientEmail]) {
          activeDiets[clientEmail] = [];
        }

        // Filter out existing overlapping dates
        const assignedDates = clientDietDays.map(d => d.dateAssigned);
        activeDiets[clientEmail] = activeDiets[clientEmail].filter((d: any) => !assignedDates.includes(d.dateAssigned));
        
        // Append new program days
        activeDiets[clientEmail].push(...clientDietDays);
      });

      localStorage.setItem('clientActiveDiets', JSON.stringify(activeDiets));

      // 3. Log Audit Activity
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Multi-day diet program "${planName}" (${days.length} Days) distributed to ${selectedClientEmails.length} clients starting ${scheduleStartDate}`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      setLoading(false);
      toast.success(`Diet plan distributed successfully with ${days.length} Days!`);
      router.push('/dashboard/coach/nutrition');
    }, 1200);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/coach/nutrition" className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Multi-Day Nutrition Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Design day-by-day nutrition routines and attach food alternatives for trainees.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step === 1 ? (
            <Button 
              variant="brand" 
              onClick={() => {
                if (!planName) return toast.error('Please enter a plan name');
                if (days.every(d => d.meals.length === 0)) {
                  return toast.error('Please add at least one meal to your diet plan');
                }
                setStep(2);
              }}
              className="rounded-2xl"
            >
              <span>Next: Select Trainees</span>
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-2xl">
                Back to Editor
              </Button>
              <Button variant="brand" onClick={handlePublishAndDistribute} disabled={loading} className="rounded-2xl">
                <CheckCircle size={16} className="mr-2" />
                {loading ? 'Distributing...' : 'Confirm & Distribute'}
              </Button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="builder-step"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Days Navigation List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Plan Days</h3>
                  <button
                    onClick={addDay}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={12} />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {days.map((day) => (
                    <div
                      key={day.id}
                      onClick={() => setActiveDayId(day.id)}
                      className={`w-full p-4 rounded-2xl cursor-pointer border text-left transition-all ${
                        activeDayId === day.id 
                          ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                          : 'border-border bg-background hover:border-border/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <input
                          type="text"
                          value={day.dayName}
                          onChange={(e) => updateDayTitle(day.id, 'dayName', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`font-black text-xs uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 rounded ${
                            activeDayId === day.id ? 'text-primary-foreground' : 'text-primary'
                          }`}
                        />
                        <button
                          onClick={(e) => removeDay(day.id, e)}
                          className={`p-1 rounded hover:bg-black/10 transition-all ${
                            activeDayId === day.id ? 'text-primary-foreground/85 hover:text-primary-foreground' : 'text-muted-foreground hover:text-destructive'
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      <input
                        type="text"
                        value={day.sessionTitle}
                        onChange={(e) => updateDayTitle(day.id, 'sessionTitle', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g. Carb Load Day"
                        className={`text-sm font-bold bg-transparent border-none w-full outline-none focus:ring-1 focus:ring-primary/20 rounded ${
                          activeDayId === day.id ? 'text-white placeholder:text-white/50' : 'text-white placeholder:text-muted-foreground/60'
                        }`}
                      />
                      
                      <div className="flex justify-between items-center text-[10px] mt-3 opacity-80">
                        <span>Meals count</span>
                        <span className="font-mono font-bold">{day.meals.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column: Meal Editor list */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-8 bg-card border border-border shadow-xl">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Diet Program Name (e.g. Lean Muscle Diet)"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="text-3xl font-black bg-transparent border-none outline-none placeholder:text-muted-foreground w-full tracking-tighter"
                  />
                  <textarea 
                    placeholder="Add details about target calorie windows, nutritional split, hydration tips, etc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none text-sm text-muted-foreground leading-relaxed h-16"
                  />
                </div>
              </Card>

              {/* Meals List */}
              <div className="space-y-6">
                {activeDay.meals.map((meal, mIdx) => (
                  <div key={meal.id} className="p-8 rounded-[2rem] bg-card border border-border space-y-6 shadow-sm">
                    
                    {/* Meal Header */}
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-orange-500/10 text-orange-500 w-6 h-6 rounded-full flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMealInActiveDay(meal.id, 'name', e.target.value)}
                          className="font-bold text-lg bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 text-white"
                        />
                        <div className="flex items-center text-[10px] font-bold bg-secondary/80 px-2.5 py-1 rounded-xl border border-border">
                          <Clock size={12} className="mr-1.5 text-muted-foreground" />
                          <input 
                            type="text" 
                            value={meal.time}
                            onChange={(e) => updateMealInActiveDay(meal.id, 'time', e.target.value)}
                            className="bg-transparent w-16 outline-none text-white text-[10px]"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeMealFromActiveDay(meal.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Food Items in Meal */}
                    <div className="space-y-3">
                      {meal.foods.map((food) => (
                        <div key={food.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-background border border-border items-center">
                          <div className="md:col-span-4">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5 block">Food Item</label>
                            <input 
                              type="text" 
                              value={food.name}
                              onChange={(e) => updateFoodInMeal(meal.id, food.id, 'name', e.target.value)}
                              className="w-full bg-transparent font-bold text-xs outline-none text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5 block">Amount</label>
                            <input 
                              type="text" 
                              value={food.amount}
                              onChange={(e) => updateFoodInMeal(meal.id, food.id, 'amount', e.target.value)}
                              className="w-full bg-transparent text-xs outline-none text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-bold text-orange-500 uppercase mb-0.5 block">Cals</label>
                            <input 
                              type="number" 
                              value={food.calories}
                              onChange={(e) => updateFoodInMeal(meal.id, food.id, 'calories', Number(e.target.value))}
                              className="w-full bg-transparent text-xs font-bold outline-none text-white"
                            />
                          </div>
                          <div className="md:col-span-3 grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] font-black text-blue-500 block">P (g)</label>
                              <input 
                                type="number" 
                                value={food.protein}
                                onChange={(e) => updateFoodInMeal(meal.id, food.id, 'protein', Number(e.target.value))}
                                className="w-full bg-transparent text-xs outline-none text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-green-500 block">C (g)</label>
                              <input 
                                type="number" 
                                value={food.carbs}
                                onChange={(e) => updateFoodInMeal(meal.id, food.id, 'carbs', Number(e.target.value))}
                                className="w-full bg-transparent text-xs outline-none text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-yellow-500 block">F (g)</label>
                              <input 
                                type="number" 
                                value={food.fats}
                                onChange={(e) => updateFoodInMeal(meal.id, food.id, 'fats', Number(e.target.value))}
                                className="w-full bg-transparent text-xs outline-none text-white"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-1 flex justify-end">
                            <button onClick={() => removeFoodFromMeal(meal.id, food.id)} className="text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addFoodToMeal(meal.id)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-orange-500/50 hover:text-orange-500 text-xs font-bold text-muted-foreground transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Food Item</span>
                      </button>
                    </div>

                    {/* Food Alternatives (بدائل الأكل) */}
                    <div className="pt-3 border-t border-border/50 space-y-2">
                      <label className="block text-[10px] font-bold text-primary uppercase tracking-wider">
                        Food Alternatives & Options (بدائل الأكل)
                      </label>
                      <textarea
                        value={meal.alternatives}
                        onChange={(e) => updateMealInActiveDay(meal.id, 'alternatives', e.target.value)}
                        placeholder="e.g. Replace Chicken breast with 180g Tilapia fish or 150g extra-lean beef fillet..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary/20 outline-none text-white resize-none"
                      />
                    </div>

                  </div>
                ))}

                <button
                  onClick={addMealToActiveDay}
                  className="w-full py-5 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 hover:text-primary text-sm font-bold text-muted-foreground transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} />
                  <span>Add Meal to {activeDay.dayName}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Macro Summary sidebar */}
            <div className="lg:col-span-3 space-y-6 sticky top-24">
              <Card className="p-6 bg-card border border-border space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-orange-500/5 rounded-full blur-3xl w-48 h-48 -z-10" />
                
                <div>
                  <h3 className="font-bold text-base text-white">Daily Target Summary</h3>
                  <p className="text-[10px] text-muted-foreground">Calculated macros output for {activeDay.dayName}.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex justify-between items-center">
                    <div className="flex items-center gap-2.5 text-orange-500">
                      <Flame size={18} />
                      <span className="text-[10px] font-black uppercase">Calories</span>
                    </div>
                    <span className="font-bold text-sm">{activeDayTotals.calories} kcal</span>
                  </div>

                  {[
                    { label: 'Protein', value: activeDayTotals.protein, color: 'bg-blue-500', icon: Zap, text: 'text-blue-500' },
                    { label: 'Carbs', value: activeDayTotals.carbs, color: 'bg-green-500', icon: Leaf, text: 'text-green-500' },
                    { label: 'Fats', value: activeDayTotals.fats, color: 'bg-yellow-500', icon: Droplets, text: 'text-yellow-500' }
                  ].map((m) => (
                    <div key={m.label} className="p-4 rounded-2xl bg-secondary/20 border border-border flex justify-between items-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className={`p-1.5 rounded-lg ${m.color}/10 ${m.text}`}>
                          <m.icon size={14} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">{m.label}</span>
                      </div>
                      <span className="font-bold text-sm">{m.value}g</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="distribute-step"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Client Multi-selector */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users size={20} className="text-primary" />
                      <span>Target Clients Selection</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Select trainees to distribute this {days.length}-day nutrition program to.</p>
                  </div>
                  {clients.length > 0 && (
                    <button
                      onClick={handleSelectAllClients}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {selectedClientEmails.length === clients.length ? 'Deselect All' : 'Select All Clients'}
                    </button>
                  )}
                </div>

                {clients.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">You don't have any onboarded clients yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clients.map((client) => {
                      const isSelected = selectedClientEmails.includes(client.email);
                      return (
                        <div
                          key={client.id}
                          onClick={() => handleToggleSelectClient(client.email)}
                          className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border bg-background hover:border-border/80'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm text-white">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                          }`}>
                            {isSelected && <CheckCircle size={14} className="stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Date Picker */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    <span>Smart Scheduler</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Select the start date of this multi-day nutrition schedule.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Schedule Start Date *</label>
                  <input
                    type={scheduleStartDate ? "date" : "text"}
                    placeholder="yyyy-mm-dd"
                    value={scheduleStartDate}
                    onChange={(e) => setScheduleStartDate(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.type = 'date';
                      try { e.currentTarget.showPicker(); } catch (err) {}
                    }}
                    onBlur={(e) => {
                      e.currentTarget.type = 'text';
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none text-white cursor-pointer"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                    💡 **Multi-Day Diet Scheduling**: 
                    Day 1 nutrition plan will load on **{scheduleStartDate || 'Start Date'}**. 
                    Subsequent days will be sequentially scheduled for following days.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button
                    onClick={handlePublishAndDistribute}
                    disabled={loading || selectedClientEmails.length === 0}
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <Globe size={16} />
                    <span>{loading ? 'Publishing program...' : 'Confirm and Publish'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
