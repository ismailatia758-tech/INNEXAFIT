'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft,
  Search,
  Dumbbell,
  Sparkles,
  Clock,
  Calendar,
  Users,
  Video,
  Link2,
  Database,
  ArrowRight,
  CheckCircle,
  FileVideo,
  Globe,
  PlusCircle,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: string;
  animationUrl: string;
}

const mockExerciseLibrary: ExerciseLibraryItem[] = [
  { id: 'lib-1', name: 'Barbell Bench Press', category: 'Chest', animationUrl: '/animations/bench-press.gif' },
  { id: 'lib-2', name: 'Incline Dumbbell Press', category: 'Chest', animationUrl: '/animations/incline-press.gif' },
  { id: 'lib-3', name: 'Seated Cable Row', category: 'Back', animationUrl: '/animations/cable-row.gif' },
  { id: 'lib-4', name: 'Lat Pulldown (Wide Grip)', category: 'Back', animationUrl: '/animations/lat-pulldown.gif' },
  { id: 'lib-5', name: 'Barbell Back Squat', category: 'Legs', animationUrl: '/animations/back-squat.gif' },
  { id: 'lib-6', name: 'Romanian Deadlift (RDL)', category: 'Legs', animationUrl: '/animations/rdl.gif' },
  { id: 'lib-7', name: 'Dumbbell Lateral Raise', category: 'Shoulders', animationUrl: '/animations/lateral-raise.gif' },
  { id: 'lib-8', name: 'Standing Overhead Press', category: 'Shoulders', animationUrl: '/animations/overhead-press.gif' },
  { id: 'lib-9', name: 'Incline Dumbbell Curl', category: 'Arms', animationUrl: '/animations/bicep-curl.gif' },
  { id: 'lib-10', name: 'Tricep Rope Pushdown', category: 'Arms', animationUrl: '/animations/tricep-pushdown.gif' },
];

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weightTarget: number;
  weightUnit: 'kg' | 'lbs';
  restInterval: number;
  mediaType: 'library' | 'upload' | 'embed';
  libraryId?: string;
  uploadedFileName?: string;
  embedUrl?: string;
  notes: string;
}

interface WorkoutDay {
  id: string;
  dayName: string; // e.g. "Day 1", "Day 2"
  sessionTitle: string; // e.g. "Chest & Biceps"
  exercises: WorkoutExercise[];
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function WorkoutBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Editor, Step 2: Distribution
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  
  // Multi-day workout structure
  const [days, setDays] = useState<WorkoutDay[]>([
    { id: 'day-1', dayName: 'Day 1', sessionTitle: 'Pull Day (Back & Biceps)', exercises: [] }
  ]);
  const [activeDayId, setActiveDayId] = useState('day-1');

  // Distribution states
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Search state for library
  const [searchQuery, setSearchQuery] = useState('');

  // Previous comparison states
  const [sidebarTab, setSidebarTab] = useState<'library' | 'previous'>('library');
  const [compareClientEmail, setCompareClientEmail] = useState('');
  const [compareWorkoutDays, setCompareWorkoutDays] = useState<any[]>([]);

  // Load comparison workouts when trainee selection changes
  useEffect(() => {
    if (!compareClientEmail) {
      setCompareWorkoutDays([]);
      return;
    }
    const activeWorkoutsStr = localStorage.getItem('clientActiveWorkouts') || '{}';
    const activeWorkouts = JSON.parse(activeWorkoutsStr);
    const clientDays = activeWorkouts[compareClientEmail] || [];
    setCompareWorkoutDays(clientDays);

    // Auto-select in Step 2 distribution selection as a convenience
    if (!selectedClientEmails.includes(compareClientEmail)) {
      setSelectedClientEmails(prev => [...prev, compareClientEmail]);
    }
  }, [compareClientEmail]);

  // Copy exercise helper
  const copyExerciseToCurrentDay = (prevEx: any) => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: prevEx.name,
      sets: prevEx.sets?.length || 3,
      reps: prevEx.sets?.[0]?.targetReps?.toString() || '12',
      weightTarget: prevEx.sets?.[0]?.targetWeight || 50,
      weightUnit: prevEx.sets?.[0]?.targetWeightUnit || 'kg',
      restInterval: prevEx.sets?.[0]?.targetRest || 90,
      mediaType: prevEx.mediaType || 'library',
      libraryId: prevEx.libraryId || '',
      embedUrl: prevEx.embedUrl || '',
      uploadedFileName: prevEx.uploadedFileName || '',
      notes: prevEx.notes || ''
    };

    setDays(days.map(d => 
      d.id === activeDayId 
        ? { ...d, exercises: [...d.exercises, newEx] }
        : d
    ));
    toast.success(`تم نسخ "${prevEx.name}" إلى برنامج اليوم الحالي! 💪`);
  };

  // Load clients and defaults
  useEffect(() => {
    const savedClients = localStorage.getItem('coachClients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const addDay = () => {
    const nextNum = days.length + 1;
    const newDayId = `day-${Math.random().toString(36).substr(2, 9)}`;
    const newDay: WorkoutDay = {
      id: newDayId,
      dayName: `Day ${nextNum}`,
      sessionTitle: `Session ${nextNum}`,
      exercises: []
    };
    setDays([...days, newDay]);
    setActiveDayId(newDayId);
    toast.success(`Day ${nextNum} added to plan!`);
  };

  const removeDay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (days.length === 1) {
      toast.error('Your workout plan must contain at least one day.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this training day and all its exercises?')) {
      const updated = days.filter(d => d.id !== id);
      setDays(updated);
      
      // Update active day if deleted
      if (activeDayId === id) {
        setActiveDayId(updated[0].id);
      }
      toast.success('Day removed');
    }
  };

  const updateDayTitle = (id: string, field: 'dayName' | 'sessionTitle', value: string) => {
    setDays(days.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addExerciseToActiveDay = (item: ExerciseLibraryItem) => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      sets: 3,
      reps: '12',
      weightTarget: 60,
      weightUnit: 'kg',
      restInterval: 90,
      mediaType: 'library',
      libraryId: item.id,
      notes: ''
    };
    
    setDays(days.map(d => 
      d.id === activeDayId 
        ? { ...d, exercises: [...d.exercises, newEx] }
        : d
    ));
    
    const currentDayName = days.find(d => d.id === activeDayId)?.dayName || 'current day';
    toast.success(`Added ${item.name} to ${currentDayName}!`);
  };

  const addCustomExerciseToActiveDay = () => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Custom Exercise',
      sets: 3,
      reps: '12',
      weightTarget: 40,
      weightUnit: 'kg',
      restInterval: 60,
      mediaType: 'embed',
      embedUrl: '',
      notes: ''
    };

    setDays(days.map(d => 
      d.id === activeDayId 
        ? { ...d, exercises: [...d.exercises, newEx] }
        : d
    ));
  };

  const updateExerciseInActiveDay = (id: string, field: keyof WorkoutExercise, value: any) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        exercises: d.exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
      };
    }));
  };

  const removeExerciseFromActiveDay = (id: string) => {
    setDays(days.map(d => {
      if (d.id !== activeDayId) return d;
      return {
        ...d,
        exercises: d.exercises.filter(ex => ex.id !== id)
      };
    }));
    toast.success('Exercise removed');
  };

  const handleFileUpload = (id: string, fileName: string) => {
    updateExerciseInActiveDay(id, 'uploadedFileName', fileName);
    toast.success(`Video file "${fileName}" attached successfully!`);
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

  const handlePublishAndDistribute = async () => {
    if (!planName) return toast.error('Please enter a plan name');
    if (days.every(d => d.exercises.length === 0)) {
      return toast.error('Please add at least one exercise to your plan');
    }
    if (selectedClientEmails.length === 0) return toast.error('Please select at least one client to distribute the plan to');
    if (!scheduleStartDate) return toast.error('Please select a schedule start date');

    setLoading(true);

    setTimeout(() => {
      // 1. Save general plan to platform workouts database mock
      const savedPlans = localStorage.getItem('platformWorkoutPlans') || '[]';
      const allPlans = JSON.parse(savedPlans);
      
      const newPlan = {
        id: 'plan-' + Math.random().toString(36).substr(2, 9),
        name: planName,
        description,
        days: days.map(d => ({
          dayName: d.dayName,
          sessionTitle: d.sessionTitle,
          exercisesCount: d.exercises.length
        })),
        targets: selectedClientEmails,
        scheduleStartDate,
        createdAt: new Date().toISOString()
      };

      allPlans.push(newPlan);
      localStorage.setItem('platformWorkoutPlans', JSON.stringify(allPlans));

      // 2. Distribute: push to each target client's active workouts feed in localStorage
      const activeWorkoutsStr = localStorage.getItem('clientActiveWorkouts') || '{}';
      const activeWorkouts = JSON.parse(activeWorkoutsStr);

      selectedClientEmails.forEach(clientEmail => {
        // Map the multi-day plan to the client's active routine list
        const clientWorkoutDays = days.map((day, idx) => {
          // Calculate scheduled date for each subsequent day
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
            exercises: day.exercises.map(ex => ({
              id: ex.id,
              name: ex.name,
              category: 'Custom',
              mediaType: ex.mediaType,
              libraryId: ex.libraryId,
              embedUrl: ex.embedUrl,
              uploadedFileName: ex.uploadedFileName,
              notes: ex.notes,
              sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
                setNumber: sIdx + 1,
                targetReps: Number(ex.reps) || 12,
                targetWeight: ex.weightTarget,
                targetRest: ex.restInterval,
                isCompleted: false,
                actualReps: '',
                actualWeight: ''
              }))
            }))
          };
        });

        if (!activeWorkouts[clientEmail]) {
          activeWorkouts[clientEmail] = [];
        }

        // Filter out existing routines for the overlapping scheduled dates to prevent conflicts
        const assignedDates = clientWorkoutDays.map(d => d.dateAssigned);
        activeWorkouts[clientEmail] = activeWorkouts[clientEmail].filter((w: any) => !assignedDates.includes(w.dateAssigned));
        
        // Append all the days of the new program
        activeWorkouts[clientEmail].push(...clientWorkoutDays);
      });

      localStorage.setItem('clientActiveWorkouts', JSON.stringify(activeWorkouts));

      // 3. Log Audit Activity
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Multi-day workout program "${planName}" (${days.length} Days) distributed to ${selectedClientEmails.length} clients starting ${scheduleStartDate}`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      setLoading(false);
      toast.success(`Plan distributed successfully with ${days.length} Days!`);
      router.push('/dashboard/coach/workouts');
    }, 1200);
  };

  const activeDay = days.find(d => d.id === activeDayId) || days[0];
  const getFilteredLibrary = () => {
    let list = mockExerciseLibrary.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If query is searched, dynamically simulate results from the 1.2M+ database on the fly!
    if (searchQuery.trim().length > 1) {
      const formattedQuery = searchQuery.trim();
      const capitalized = formattedQuery.charAt(0).toUpperCase() + formattedQuery.slice(1);
      
      const dynamicItems = [
        { id: `dyn-1`, name: `${capitalized} (Barbell)`, category: 'Strength', animationUrl: '/animations/bench-press.gif' },
        { id: `dyn-2`, name: `${capitalized} (Dumbbell)`, category: 'Free Weights', animationUrl: '/animations/incline-press.gif' },
        { id: `dyn-3`, name: `Seated ${capitalized}`, category: 'Isolations', animationUrl: '/animations/cable-row.gif' },
        { id: `dyn-4`, name: `Incline ${capitalized}`, category: 'Power', animationUrl: '/animations/lat-pulldown.gif' },
        { id: `dyn-5`, name: `Cable ${capitalized} Pull`, category: 'Cables', animationUrl: '/animations/lat-pulldown.gif' },
        { id: `dyn-6`, name: `Single-Arm ${capitalized}`, category: 'Unilateral', animationUrl: '/animations/lateral-raise.gif' },
        { id: `dyn-7`, name: `Decline ${capitalized}`, category: 'Chest', animationUrl: '/animations/bench-press.gif' },
        { id: `dyn-8`, name: `Hammer ${capitalized}`, category: 'Arms', animationUrl: '/animations/bicep-curl.gif' },
        { id: `dyn-9`, name: `Prone ${capitalized}`, category: 'Back', animationUrl: '/animations/cable-row.gif' },
        { id: `dyn-10`, name: `Standing ${capitalized}`, category: 'Core', animationUrl: '/animations/overhead-press.gif' }
      ];

      // Merge results, filtering duplicates
      const existingNames = new Set(list.map(item => item.name.toLowerCase()));
      const uniqueDynamics = dynamicItems.filter(item => !existingNames.has(item.name.toLowerCase()));
      list = [...list, ...uniqueDynamics];
    }
    return list;
  };

  const filteredLibrary = getFilteredLibrary();

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/coach/workouts" className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Multi-Day Plan Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Design day-by-day routines and push custom exercise loads to your trainees.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step === 1 ? (
            <Button 
              variant="brand" 
              onClick={() => {
                if (!planName) return toast.error('Please enter a plan name');
                if (days.every(d => d.exercises.length === 0)) {
                  return toast.error('Please add at least one exercise to your plan');
                }
                setStep(2);
              }}
              className="rounded-2xl"
            >
              <span>Next: Smart Scheduler</span>
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
                        placeholder="Session name (e.g. Chest)"
                        className={`text-sm font-bold bg-transparent border-none w-full outline-none focus:ring-1 focus:ring-primary/20 rounded ${
                          activeDayId === day.id ? 'text-white placeholder:text-white/50' : 'text-white placeholder:text-muted-foreground/60'
                        }`}
                      />
                      
                      <div className="flex justify-between items-center text-[10px] mt-3 opacity-80">
                        <span>Exercises count</span>
                        <span className="font-mono font-bold">{day.exercises.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column: Exercises List Editor for Active Day */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-8 bg-card border border-border shadow-xl">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Program Name (e.g. 12-Week Transformation)"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="text-3xl font-black bg-transparent border-none outline-none placeholder:text-muted-foreground w-full tracking-tighter"
                  />
                  <textarea 
                    placeholder="Provide overarching guidelines or instructions for this training program..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none text-sm text-muted-foreground leading-relaxed h-16"
                  />
                </div>
              </Card>

              {/* Active Day Exercises */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-sm text-white">
                    Exercises for <span className="text-primary font-black">{activeDay.dayName}</span>
                  </h3>
                  <span className="text-xs font-bold text-muted-foreground">
                    {activeDay.exercises.length} Exercises Scheduled
                  </span>
                </div>

                {activeDay.exercises.length === 0 ? (
                  <div className="p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-card/50">
                    <Dumbbell className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
                    <p className="font-bold text-lg">No exercises scheduled for {activeDay.dayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Select from the library on the right or click below to build a custom exercise.</p>
                    <button
                      onClick={addCustomExerciseToActiveDay}
                      className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold text-white transition-all"
                    >
                      <Plus size={14} />
                      <span>Create Custom Exercise</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDay.exercises.map((ex, idx) => (
                      <div key={ex.id} className="p-6 rounded-[2rem] bg-card border border-border space-y-6 shadow-sm">
                        
                        {/* Title bar */}
                        <div className="flex justify-between items-center border-b border-border/50 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => updateExerciseInActiveDay(ex.id, 'name', e.target.value)}
                              className="font-bold text-base bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 text-white"
                            />
                          </div>
                          <button
                            onClick={() => removeExerciseFromActiveDay(ex.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Parameter Fields */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-2xl bg-background border border-border text-center">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Sets</label>
                            <input 
                              type="number" 
                              value={ex.sets} 
                              onChange={(e) => updateExerciseInActiveDay(ex.id, 'sets', Number(e.target.value))}
                              className="w-full bg-transparent text-center font-black text-lg outline-none text-white"
                              min={1}
                            />
                          </div>
                          <div className="p-3 rounded-2xl bg-background border border-border text-center">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Reps</label>
                            <input 
                              type="text" 
                              value={ex.reps} 
                              onChange={(e) => updateExerciseInActiveDay(ex.id, 'reps', e.target.value)}
                              className="w-full bg-transparent text-center font-black text-lg outline-none text-white"
                            />
                          </div>
                          <div className="p-3 rounded-2xl bg-background border border-border text-center">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Weight Target</label>
                            <div className="flex items-center justify-center gap-1">
                              <input 
                                type="number" 
                                value={ex.weightTarget} 
                                onChange={(e) => updateExerciseInActiveDay(ex.id, 'weightTarget', Number(e.target.value))}
                                className="w-12 bg-transparent text-center font-black text-lg outline-none text-white"
                                min={0}
                              />
                              <select
                                value={ex.weightUnit}
                                onChange={(e) => updateExerciseInActiveDay(ex.id, 'weightUnit', e.target.value)}
                                className="bg-transparent text-xs font-bold text-primary outline-none"
                              >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                              </select>
                            </div>
                          </div>
                          <div className="p-3 rounded-2xl bg-background border border-border text-center">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Rest (sec)</label>
                            <div className="flex items-center justify-center gap-0.5">
                              <input 
                                type="number" 
                                value={ex.restInterval} 
                                onChange={(e) => updateExerciseInActiveDay(ex.id, 'restInterval', Number(e.target.value))}
                                className="w-12 bg-transparent text-center font-black text-lg outline-none text-white"
                                min={0}
                              />
                              <Clock size={12} className="text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        {/* Media Integration Options */}
                        <div className="space-y-3 p-4 rounded-2xl bg-background/50 border border-border/60">
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Media Integration Attachment
                          </label>

                          <div className="flex p-1 rounded-xl bg-background border border-border max-w-sm">
                            {(['library', 'upload', 'embed'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => updateExerciseInActiveDay(ex.id, 'mediaType', mode)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  ex.mediaType === mode 
                                    ? 'bg-primary text-primary-foreground shadow' 
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {mode === 'library' ? 'Library' : mode === 'upload' ? 'Upload' : 'Embed Link'}
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {ex.mediaType === 'library' && (
                              <motion.div
                                key="lib-mode"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="flex items-center gap-2 text-xs text-muted-foreground mt-2"
                              >
                                <Database size={14} className="text-primary" />
                                <span>Using animation attachment from pre-integrated library catalog.</span>
                              </motion.div>
                            )}

                            {ex.mediaType === 'upload' && (
                              <motion.div
                                key="upload-mode"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="space-y-2 mt-2"
                              >
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold text-white cursor-pointer transition-all">
                                    <Video size={14} />
                                    <span>Upload Video File</span>
                                    <input 
                                      type="file" 
                                      accept="video/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(ex.id, file.name);
                                      }}
                                    />
                                  </label>
                                  {ex.uploadedFileName && (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                                      <FileVideo size={14} />
                                      <span className="truncate max-w-[150px]">{ex.uploadedFileName}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}

                            {ex.mediaType === 'embed' && (
                              <motion.div
                                key="embed-mode"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="space-y-2 mt-2"
                              >
                                <div className="relative">
                                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                  <input
                                    type="url"
                                    value={ex.embedUrl || ''}
                                    onChange={(e) => updateExerciseInActiveDay(ex.id, 'embedUrl', e.target.value)}
                                    placeholder="Paste YouTube or Vimeo video link..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary/20 outline-none text-white"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Notes */}
                        <div>
                          <input
                            type="text"
                            value={ex.notes}
                            onChange={(e) => updateExerciseInActiveDay(ex.id, 'notes', e.target.value)}
                            placeholder="Specific workout instructions (e.g. Focus on control)..."
                            className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/85 text-xs focus:ring-1 focus:ring-primary/20 outline-none text-white"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addCustomExerciseToActiveDay}
                      className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-border hover:border-primary/50 hover:text-primary rounded-3xl text-sm font-bold text-muted-foreground transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Custom Exercise Card</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column: Library Sidebar catalog & Previous Plan comparison */}
            <div className="lg:col-span-3 space-y-6">
              <div className="p-6 rounded-[2.5rem] bg-card border border-border flex flex-col h-[750px] sticky top-24 shadow-2xl">
                
                {/* Sidebar Mode Tabs */}
                <div className="flex p-1 rounded-xl bg-background border border-border mb-4">
                  <button
                    type="button"
                    onClick={() => setSidebarTab('library')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      sidebarTab === 'library' 
                        ? 'bg-primary text-primary-foreground shadow' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    مكتبة التمارين
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab('previous')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      sidebarTab === 'previous' 
                        ? 'bg-primary text-primary-foreground shadow' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    البرنامج السابق
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {sidebarTab === 'library' ? (
                    <motion.div
                      key="lib-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex flex-col flex-1 min-h-0"
                    >
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-wider mb-3 w-fit select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Cloud Sync: 1.2M+ Exercises Active</span>
                        </div>
                        <h3 className="text-sm font-bold">Search Cloud Library</h3>
                        <p className="text-[10px] text-muted-foreground">Select exercises to add directly to {activeDay.dayName}.</p>
                      </div>

                      <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                          type="text"
                          placeholder="Search library..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredLibrary.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No matching exercises found.</p>
                        ) : (
                          filteredLibrary.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addExerciseToActiveDay(item)}
                              className="w-full p-3 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-bold text-xs text-white group-hover:text-primary transition-colors">{item.name}</p>
                                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{item.category}</span>
                              </div>
                              <div className="p-1 rounded-lg bg-background text-muted-foreground group-hover:text-primary transition-colors shadow">
                                <Plus size={12} />
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="prev-tab"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col flex-1 min-h-0"
                    >
                      <div className="mb-4">
                        <h3 className="text-sm font-bold">مقارنة البرنامج السابق</h3>
                        <p className="text-[10px] text-muted-foreground">راجع تمرين المتدرب السابق وانسخ منه لدعم زيادة الوزن التدريجية.</p>
                      </div>

                      {/* Client Selector */}
                      <div className="mb-4">
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1.5">اختر المتدرب للمقارنة والنسخ:</label>
                        <select
                          value={compareClientEmail}
                          onChange={(e) => setCompareClientEmail(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-white focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          <option value="">-- اختر العميل --</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.email}>{c.name} ({c.email})</option>
                          ))}
                        </select>
                      </div>

                      {/* Trainee Previous Plan timeline */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                        {!compareClientEmail ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Users size={28} className="mx-auto mb-2 opacity-45" />
                            <p className="text-[11px] font-bold">الرجاء اختيار متدرب لعرض سجله الرياضي.</p>
                          </div>
                        ) : compareWorkoutDays.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground space-y-1">
                            <AlertCircle size={28} className="mx-auto mb-2 text-yellow-500 opacity-60" />
                            <p className="text-[11px] font-bold">لا يوجد تمرين سابق مسجل.</p>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">لم يتم تعيين أي برامج تدريبية سابقة لهذا العميل في قاعدة البيانات المحلية.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {compareWorkoutDays.map((day: any) => (
                              <div key={day.id} className="p-3.5 rounded-2xl bg-secondary/15 border border-border/60 space-y-2">
                                <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                                  <div>
                                    <p className="text-xs font-black text-primary">{day.dayName}</p>
                                    <p className="text-[10px] text-white font-bold truncate max-w-[150px]">{day.sessionTitle}</p>
                                  </div>
                                  <span className="text-[8px] font-mono text-muted-foreground font-semibold">{day.dateAssigned}</span>
                                </div>

                                <div className="space-y-1.5">
                                  {day.exercises && day.exercises.map((ex: any) => {
                                    const firstSet = ex.sets?.[0] || {};
                                    return (
                                      <div key={ex.id} className="flex justify-between items-center text-[10px] p-2 rounded-lg bg-background/60 border border-border/30 hover:border-primary/20 transition-all">
                                        <div className="min-w-0 pr-1">
                                          <p className="font-bold text-white truncate">{ex.name}</p>
                                          <p className="text-[9px] text-muted-foreground font-semibold">
                                            {ex.sets?.length || 3} مجموعات × {firstSet.targetReps || 12} عدات @ {firstSet.targetWeight || 50} كجم
                                          </p>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => copyExerciseToCurrentDay(ex)}
                                          title="نسخ التمرين للبرنامج الحالي"
                                          className="p-1.5 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all flex-shrink-0"
                                        >
                                          <Plus size={10} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
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
                    <p className="text-xs text-muted-foreground mt-0.5">Select trainees to distribute this {days.length}-day workout program to.</p>
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
                  <p className="text-xs text-muted-foreground mt-1">Select the start date of this multi-day schedule.</p>
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
                    💡 **Multi-Day Distribution**: 
                    Day 1 will be scheduled on **{scheduleStartDate || 'Start Date'}**. 
                    Subsequent days will be automatically assigned to the following consecutive dates.
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
