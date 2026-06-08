'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Check, 
  Sparkles, 
  Info, 
  Apple, 
  TrendingDown, 
  ChevronRight, 
  Plus, 
  Minus,
  MessageSquare,
  Send,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  Zap,
  Leaf,
  Droplets,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/useAuth';
import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

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
  isCompleted: boolean; // Trainee checked this off
}

interface NutritionDay {
  id: string;
  dayName: string; // Day 1
  sessionTitle: string; // e.g. "Low Carb Day"
  dateAssigned: string; // YYYY-MM-DD
  isCompleted: boolean;
  clientFeedbackNotes: string;
  meals: Meal[];
}

export default function NutritionTrackerPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].nutrition;
  const clientEmail = user?.email || 'client@example.com';
  const clientName = user?.name || (language === 'en' ? 'Champ' : 'البطل');

  const todayStr = new Date().toISOString().split('T')[0];

  // State
  const [assignedDays, setAssignedDays] = useState<NutritionDay[]>([]);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDietDays: NutritionDay[] = useMemo(() => {
    return [];
  }, []);

  // Hydration sync and diet plan sync
  useEffect(() => {
    // 1. Water Tracker
    const savedWater = localStorage.getItem(`clientWater_${todayStr}`);
    if (savedWater) setWaterGlasses(Number(savedWater));

    // 2. Active Diet Plan loading
    const activeDietsStr = localStorage.getItem('clientActiveDiets');
    let clientDiets: NutritionDay[] = [];

    if (activeDietsStr) {
      const activeDiets = JSON.parse(activeDietsStr);
      if (activeDiets[clientEmail] && activeDiets[clientEmail].length > 0) {
        clientDiets = activeDiets[clientEmail];
      }
    }

    // Seed default if empty
    if (clientDiets.length === 0) {
      const activeDiets = activeDietsStr ? JSON.parse(activeDietsStr) : {};
      activeDiets[clientEmail] = defaultDietDays;
      localStorage.setItem('clientActiveDiets', JSON.stringify(activeDiets));
      clientDiets = defaultDietDays;
    }

    setAssignedDays(clientDiets);
    
    // Set active day ID
    // Check if there is a plan assigned for today's date, else default to the first day
    const dayForToday = clientDiets.find(d => d.dateAssigned === todayStr);
    if (dayForToday) {
      setActiveDayId(dayForToday.id);
      setFeedbackNote(dayForToday.clientFeedbackNotes || '');
    } else {
      setActiveDayId(clientDiets[0]?.id || '');
      setFeedbackNote(clientDiets[0]?.clientFeedbackNotes || '');
    }
  }, [clientEmail, todayStr, defaultDietDays]);

  const activeDay = useMemo(() => {
    return assignedDays.find(d => d.id === activeDayId) || assignedDays[0];
  }, [assignedDays, activeDayId]);

  // Update notes state when switching days
  useEffect(() => {
    if (activeDay) {
      setFeedbackNote(activeDay.clientFeedbackNotes || '');
    }
  }, [activeDayId, activeDay]);

  // Calculations for Calories and Macros of the Active Day
  // Targets (sum of all food items)
  const targets = useMemo(() => {
    if (!activeDay) return { calories: 2000, protein: 150, carbs: 200, fats: 70 };
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

  // Eaten (sum of completed meals)
  const eaten = useMemo(() => {
    if (!activeDay) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return activeDay.meals.reduce((acc, meal) => {
      if (meal.isCompleted) {
        meal.foods.forEach(food => {
          acc.calories += Number(food.calories) || 0;
          acc.protein += Number(food.protein) || 0;
          acc.carbs += Number(food.carbs) || 0;
          acc.fats += Number(food.fats) || 0;
        });
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [activeDay]);

  // Water Glass Handlers
  const handleWaterChange = (amount: number) => {
    const newGlasses = Math.max(0, waterGlasses + amount);
    setWaterGlasses(newGlasses);
    localStorage.setItem(`clientWater_${todayStr}`, String(newGlasses));
    if (amount > 0) {
      toast.success(t.toastWaterLogged);
    }
  };

  // Toggle Meal Complete status
  const handleToggleMeal = (mealId: string) => {
    if (!activeDay) return;

    const updatedDays = assignedDays.map(day => {
      if (day.id !== activeDayId) return day;

      const updatedMeals = day.meals.map(meal => {
        if (meal.id !== mealId) return meal;
        const newStatus = !meal.isCompleted;
        if (newStatus) {
          toast.success(
            language === 'en'
              ? `Meal "${meal.name}" confirmed successfully! 🍽️`
              : `وجبة "${meal.name}" تم تأكيدها بنجاح! 🍽️`
          );
        }
        return { ...meal, isCompleted: newStatus };
      });

      // Day is completed if all meals in it are checked off
      const allDone = updatedMeals.every(m => m.isCompleted);

      return { 
        ...day, 
        meals: updatedMeals,
        isCompleted: allDone
      };
    });

    setAssignedDays(updatedDays);

    // Persist to local storage
    const activeDietsStr = localStorage.getItem('clientActiveDiets') || '{}';
    const activeDiets = JSON.parse(activeDietsStr);
    activeDiets[clientEmail] = updatedDays;
    localStorage.setItem('clientActiveDiets', JSON.stringify(activeDiets));
  };

  // Submit Feedback & Notes to Coach
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Update notes in state and localStorage
      const updatedDays = assignedDays.map(day => {
        if (day.id !== activeDayId) return day;
        return { ...day, clientFeedbackNotes: feedbackNote };
      });

      setAssignedDays(updatedDays);

      const activeDietsStr = localStorage.getItem('clientActiveDiets') || '{}';
      const activeDiets = JSON.parse(activeDietsStr);
      activeDiets[clientEmail] = updatedDays;
      localStorage.setItem('clientActiveDiets', JSON.stringify(activeDiets));

      // 2. Append Coach notification
      const savedNotifs = localStorage.getItem('coachNotifications');
      const notifications = savedNotifs ? JSON.parse(savedNotifs) : [];

      const completedMealsCount = activeDay.meals.filter(m => m.isCompleted).length;
      const totalMealsCount = activeDay.meals.length;

      const newNotif = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        type: 'report',
        text: language === 'en'
          ? `Client "${clientName}" confirmed meals (${completedMealsCount}/${totalMealsCount}) for ${activeDay.dayName} and sent a note: "${feedbackNote || 'No notes'}"`
          : `العميل "${clientName}" أكد وجبات (${completedMealsCount}/${totalMealsCount}) لـ ${activeDay.dayName} وأرسل ملحوظة: "${feedbackNote || 'بدون ملحوظات إضافية'}"`,
        time: language === 'en' ? 'Just Now' : 'الآن',
        read: false
      };

      localStorage.setItem('coachNotifications', JSON.stringify([newNotif, ...notifications]));

      // 3. Log Audit Activity for tracking
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Client "${clientName}" logged nutrition updates for "${activeDay.dayName}" and sent feedback.`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      // Trigger standard custom event to sync multi-tab dashboard headers if applicable
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      toast.success(t.toastFeedbackSent);
    }, 800);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Arabic/English Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>{t.title}</span>
            <Apple className="text-primary animate-pulse" size={28} />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.desc}
          </p>
        </div>
        
        {/* Date assigned indicator */}
        {activeDay && (
          <div className="px-4 py-2 rounded-2xl bg-secondary/50 border border-border flex items-center gap-2 text-xs font-bold">
            <Calendar size={14} className="text-primary" />
            <span className="text-muted-foreground">{t.dateAssigned}</span>
            <span className="text-white">{activeDay.dateAssigned}</span>
          </div>
        )}
      </div>

      {/* Day Selector Navigation Tabs */}
      {assignedDays.length > 0 && (
        <div className="flex flex-wrap gap-2.5 pb-2 border-b border-border/40">
          {assignedDays.map((day) => {
            const isActive = day.id === activeDayId;
            const completedCount = day.meals.filter(m => m.isCompleted).length;
            const totalCount = day.meals.length;
            const isFullyCompleted = day.isCompleted || (totalCount > 0 && completedCount === totalCount);

            return (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`px-5 py-3 rounded-2xl border text-start transition-all duration-200 flex flex-col gap-0.5 ${
                  isActive 
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase">{day.dayName}</span>
                  {isFullyCompleted && (
                    <CheckCircle2 size={12} className={isActive ? 'text-primary-foreground' : 'text-green-500'} />
                  )}
                </div>
                <span className={`text-[10px] truncate max-w-[180px] font-bold ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {day.sessionTitle.split('(')[0].trim()}
                </span>
                <div className="flex items-center justify-between text-[9px] mt-1.5 opacity-85">
                  <span>{t.completedMeals}</span>
                  <span className="font-mono font-bold ml-1">{completedCount}/{totalCount}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Grid View */}
      {/* Main Grid View */}
      {assignedDays.length === 0 ? (
        <div className="p-16 border border-dashed border-border rounded-[2.5rem] text-center bg-card max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4">
          <Utensils className="text-muted-foreground/60" size={48} />
          <h3 className="font-bold text-lg text-white">No Nutrition Plan Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Your coach hasn't scheduled any diet sheets or meal packages for your account yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Daily targets & meals logs */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active Day Macros Overview */}
            {activeDay && (
              <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-primary/5 rounded-full blur-3xl w-48 h-48 -z-10" />
                
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Flame size={20} className="text-orange-500" />
                    <span>{t.macrosSummary}</span>
                    <span className="text-primary font-black">{activeDay.dayName}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground font-bold">{activeDay.sessionTitle}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Calories */}
                  <div className="p-4 rounded-2xl bg-background border border-border text-center flex flex-col justify-between">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t.calories}</p>
                    <p className="text-lg font-black mt-2 text-foreground">{eaten.calories} / {targets.calories}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.caloriesUnit}</p>
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (eaten.calories / (targets.calories || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="p-4 rounded-2xl bg-background border border-border text-center flex flex-col justify-between">
                    <p className="text-[10px] text-blue-500 uppercase font-black tracking-wider">{t.protein}</p>
                    <p className="text-lg font-black mt-2 text-foreground">{eaten.protein}g / {targets.protein}g</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.proteinSub}</p>
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (eaten.protein / (targets.protein || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="p-4 rounded-2xl bg-background border border-border text-center flex flex-col justify-between">
                    <p className="text-[10px] text-green-500 uppercase font-black tracking-wider">{t.carbs}</p>
                    <p className="text-lg font-black mt-2 text-foreground">{eaten.carbs}g / {targets.carbs}g</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.carbsSub}</p>
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (eaten.carbs / (targets.carbs || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="p-4 rounded-2xl bg-background border border-border text-center flex flex-col justify-between">
                    <p className="text-[10px] text-yellow-500 uppercase font-black tracking-wider">{t.fats}</p>
                    <p className="text-lg font-black mt-2 text-foreground">{eaten.fats}g / {targets.fats}g</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.fatsSub}</p>
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (eaten.fats / (targets.fats || 1)) * 100)}%` }} />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Meals Checklist */}
            {activeDay && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                  <Utensils size={18} className="text-primary" />
                  <span>{t.todayMeals} ({activeDay.dayName})</span>
                </h3>

                <div className="space-y-6">
                  {activeDay.meals.map((meal, idx) => {
                    const mealCals = meal.foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
                    const mealPro = meal.foods.reduce((sum, f) => sum + (Number(f.protein) || 0), 0);
                    const mealCarb = meal.foods.reduce((sum, f) => sum + (Number(f.carbs) || 0), 0);
                    const mealFat = meal.foods.reduce((sum, f) => sum + (Number(f.fats) || 0), 0);

                    return (
                      <div 
                        key={meal.id}
                        className={`p-6 rounded-[2rem] border transition-all duration-200 ${
                          meal.isCompleted 
                            ? 'bg-primary/5 border-primary/30 shadow-md' 
                            : 'bg-card border-border hover:border-border/80 shadow-sm'
                        }`}
                      >
                        {/* Meal Header */}
                        <div className="flex justify-between items-start gap-4 pb-3 border-b border-border/30">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                                {t.mealIndex} {idx + 1}
                              </span>
                              <h4 className="font-bold text-base text-white">{meal.name}</h4>
                            </div>
                            <div className="flex items-center text-[10px] text-muted-foreground font-bold pt-1">
                              <Clock size={12} className="mr-1 text-primary animate-pulse" />
                              <span>{t.suggestedTime} {meal.time}</span>
                            </div>
                          </div>

                          {/* Interactive toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleMeal(meal.id)}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                              meal.isCompleted 
                                ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                                : 'border-border bg-background hover:bg-secondary text-transparent hover:text-muted-foreground/30'
                            }`}
                          >
                            <Check size={18} className="stroke-[3]" />
                          </button>
                        </div>

                        {/* Food ingredients table */}
                        <div className="mt-4 space-y-2">
                          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest block mb-2">{t.ingredientsTitle}</span>
                          
                          <div className="space-y-1.5">
                            {meal.foods.map((food) => (
                              <div key={food.id} className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-background/50 border border-border/30">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="font-bold text-white">{food.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                                  <span className="font-semibold text-white/80">{food.amount}</span>
                                  <span className="hidden sm:inline">|</span>
                                  <span>{food.calories} {t.caloriesUnit}</span>
                                  <span className="hidden sm:inline">|</span>
                                  <span className="text-blue-500 font-bold">P: {food.protein}g</span>
                                  <span>C: {food.carbs}g</span>
                                  <span className="text-yellow-500">F: {food.fats}g</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Highlighted Food Alternatives (بدائل الأكل والخيارات) */}
                        {meal.alternatives && (
                          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs leading-relaxed space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-1">
                              <Info size={14} />
                              <span>{t.alternativesTitle}</span>
                            </div>
                            <p className="text-muted-foreground font-medium pr-1 text-[11px]">
                              {meal.alternatives}
                            </p>
                          </div>
                        )}

                        {/* Meal Macro Summary Footer */}
                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-border/30 text-[10px] font-bold text-muted-foreground">
                          <div className="flex gap-3">
                            <span className="text-blue-500">{language === 'en' ? 'Protein' : 'بروتين'}: {mealPro}g</span>
                            <span className="text-green-500">{language === 'en' ? 'Carbs' : 'كارب'}: {mealCarb}g</span>
                            <span className="text-yellow-500">{language === 'en' ? 'Fats' : 'دهون'}: {mealFat}g</span>
                          </div>
                          <span className="text-primary font-black text-xs">{mealCals} {t.caloriesUnit}</span>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Trainee Note Feedbacks & Submission form */}
                <form onSubmit={handleSubmitFeedback} className="p-8 rounded-[2rem] bg-card border border-border space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-white">
                    <MessageSquare className="text-primary" size={20} />
                    <h3 className="font-bold text-base">{t.sendFeedbackTitle}</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.sendFeedbackDesc}
                  </p>

                  <textarea
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none text-white resize-none"
                  />

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-md disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? t.sendingFeedbackBtn : t.sendFeedbackBtn}</span>
                    </button>
                  </div>
                </form>

              </div>
            )}

          </div>

          {/* Right Side: Hydration Station & Quick Tips */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Hydration Station Card */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border text-center space-y-6 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t.hydrationTitle}</h3>
              
              {/* Animated fluid circle */}
              <div className="relative w-40 h-48 mx-auto bg-secondary/30 rounded-3xl overflow-hidden border-2 border-border flex items-end shadow-inner">
                <motion.div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-500/80 backdrop-blur-sm relative"
                  animate={{ height: `${Math.min(100, (waterGlasses / 10) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {/* bubble particle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-700/50 to-transparent flex flex-col justify-around items-center opacity-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
                  </div>
                </motion.div>
                
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-10">
                  <Droplet className="text-blue-400 drop-shadow-md" size={32} />
                  <p className="text-3xl font-black text-foreground mt-2">{waterGlasses * 250} ml</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{t.hydrationLogged}</p>
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>{t.hydrationTarget}</span>
                <span>{language === 'en' ? 'Remaining:' : 'المتبقي:'} {Math.max(0, 2500 - (waterGlasses * 250))} {language === 'en' ? 'ml' : 'مل'}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleWaterChange(-1)}
                  disabled={waterGlasses === 0}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  {t.hydrationMinus}
                </button>
                <button
                  onClick={() => handleWaterChange(1)}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {t.hydrationPlus}
                </button>
              </div>
            </div>

            {/* Coach Advice / Tips Card */}
            <div className="p-6 rounded-[2rem] bg-card border border-border space-y-4 shadow-sm">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-primary uppercase tracking-wider">
                <Info size={14} />
                <span>{t.adviceTitle}</span>
              </h4>
              <div className="space-y-3 text-[11px] text-muted-foreground leading-relaxed">
                <p>{t.advice1}</p>
                <p>{t.advice2}</p>
                <p>{t.advice3}</p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
