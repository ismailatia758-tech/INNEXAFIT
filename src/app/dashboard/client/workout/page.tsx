'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Clock, 
  Check, 
  RotateCcw, 
  Save, 
  CheckCircle2,
  Video,
  Link2,
  Database,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/useAuth';

interface WorkoutSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number; 
  targetRest: number; 
  actualReps?: string;
  actualWeight?: string;
  isCompleted: boolean;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  mediaType?: 'library' | 'upload' | 'embed';
  libraryId?: string;
  embedUrl?: string;
  uploadedFileName?: string;
  notes?: string;
  sets: WorkoutSet[];
}

interface WorkoutSession {
  id: string;
  dayName: string;
  sessionTitle: string;
  dateAssigned: string;
  isCompleted: boolean;
  clientFeedbackNotes: string;
  exercises: Exercise[];
}

const initialWorkouts: WorkoutSession[] = [];

export default function WorkoutLoggerPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSessionIdx, setActiveSessionIdx] = useState(0);

  // Timer states for rest periods
  const [timerDuration, setTimerDuration] = useState(90);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Load custom assigned workouts from localStorage based on user session email
  useEffect(() => {
    if (!user?.email) return;

    const savedActiveWorkouts = localStorage.getItem('clientActiveWorkouts');
    if (savedActiveWorkouts) {
      try {
        const allActive = JSON.parse(savedActiveWorkouts);
        // filter workouts for this specific client email
        const clientWorkouts = allActive[user.email] || [];
        if (clientWorkouts.length > 0) {
          setSessions(clientWorkouts);
          setActiveSessionIdx(clientWorkouts.length - 1); // Select the most recent scheduled workout
        } else {
          setSessions(initialWorkouts);
        }
      } catch (err) {
        setSessions(initialWorkouts);
      }
    } else {
      setSessions(initialWorkouts);
    }
  }, [user]);

  // Rest Timer logic
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      toast.success('Rest over! Ready for your next set.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startRestTimer = (seconds: number) => {
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const stopRestTimer = () => {
    setTimerActive(false);
    setTimeLeft(0);
  };

  const handleInputChange = (
    exId: string,
    setNum: number,
    field: 'actualReps' | 'actualWeight',
    value: string
  ) => {
    const updated = sessions.map((sess, sIdx) => {
      if (sIdx !== activeSessionIdx) return sess;
      
      const updatedExercises = sess.exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        
        const updatedSets = ex.sets.map((set) => {
          if (set.setNumber !== setNum) return set;
          return { ...set, [field]: value };
        });
        return { ...ex, sets: updatedSets };
      });
      return { ...sess, exercises: updatedExercises };
    });
    setSessions(updated);
  };

  const handleToggleSetComplete = (exId: string, setNum: number, restSeconds: number) => {
    let shouldStartTimer = false;
    const updated = sessions.map((sess, sIdx) => {
      if (sIdx !== activeSessionIdx) return sess;
      
      const updatedExercises = sess.exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        
        const updatedSets = ex.sets.map((set) => {
          if (set.setNumber !== setNum) return set;
          
          const nextState = !set.isCompleted;
          if (nextState) {
            shouldStartTimer = true;
            // Autofill targets if left blank
            const reps = set.actualReps?.trim() ? set.actualReps : String(set.targetReps);
            const weight = set.actualWeight?.trim() ? set.actualWeight : String(set.targetWeight);
            return { ...set, isCompleted: nextState, actualReps: reps, actualWeight: weight };
          }
          return { ...set, isCompleted: nextState };
        });
        return { ...ex, sets: updatedSets };
      });
      return { ...sess, exercises: updatedExercises };
    });

    setSessions(updated);
    saveToLocalStorage(updated);

    if (shouldStartTimer) {
      startRestTimer(restSeconds);
      toast.success(`Set ${setNum} marked done! Rest timer started.`);
    }
  };

  const handleNotesChange = (value: string) => {
    const updated = sessions.map((sess, sIdx) => {
      if (sIdx !== activeSessionIdx) return sess;
      return { ...sess, clientFeedbackNotes: value };
    });
    setSessions(updated);
  };

  const handleToggleSessionCompletion = () => {
    const updated = sessions.map((sess, sIdx) => {
      if (sIdx !== activeSessionIdx) return sess;
      const nextCompletedState = !sess.isCompleted;
      toast.success(nextCompletedState ? 'Workout session marked as COMPLETED!' : 'Workout status reset to in-progress');
      return { ...sess, isCompleted: nextCompletedState };
    });
    setSessions(updated);
    saveToLocalStorage(updated);
  };

  const saveToLocalStorage = (updatedSessions: WorkoutSession[]) => {
    if (!user?.email) return;

    // Save to client active workouts database
    const savedActiveWorkouts = localStorage.getItem('clientActiveWorkouts') || '{}';
    const allActive = JSON.parse(savedActiveWorkouts);
    allActive[user.email] = updatedSessions;
    localStorage.setItem('clientActiveWorkouts', JSON.stringify(allActive));

    // Also update coach feedback database so the coach can review achievements
    const coachReviewDataStr = localStorage.getItem('coachReviewsData') || '{}';
    const coachReviewData = JSON.parse(coachReviewDataStr);
    
    // Find active session
    const activeSess = updatedSessions[activeSessionIdx];
    coachReviewData[activeSess.id] = {
      clientId: user.email,
      clientName: user.name,
      sessionTitle: activeSess.sessionTitle,
      dateAssigned: activeSess.dateAssigned,
      isCompleted: activeSess.isCompleted,
      clientNotes: activeSess.clientFeedbackNotes,
      exercises: activeSess.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({
          setNumber: s.setNumber,
          targetReps: s.targetReps,
          targetWeight: s.targetWeight,
          actualReps: s.actualReps,
          actualWeight: s.actualWeight,
          isCompleted: s.isCompleted
        }))
      })),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('coachReviewsData', JSON.stringify(coachReviewData));
  };

  const handleSaveWorkout = () => {
    saveToLocalStorage(sessions);
    toast.success('Workout logs and achievements saved successfully!');
  };

  const activeSession = sessions[activeSessionIdx];

  if (sessions.length === 0 || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Dumbbell className="text-muted-foreground animate-pulse" size={48} />
        <h3 className="font-bold text-lg">No Workouts Assigned</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Your coach hasn't scheduled any workout routines for your account yet. Check back later!
        </p>
      </div>
    );
  }
  
  // Stats
  const totalSets = activeSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = activeSession.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainee Workout Feed</h1>
          <p className="text-muted-foreground mt-2">Log your actual performance metrics, add workout notes, and mark sessions complete.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveWorkout}
            className="flex items-center space-x-2 bg-secondary text-foreground border border-border px-5 py-3 rounded-xl font-bold hover:bg-secondary/80 transition-all text-xs"
          >
            <span>Save Progress</span>
          </button>
          <button
            onClick={handleToggleSessionCompletion}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all text-xs shadow ${
              activeSession.isCompleted 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-primary hover:bg-primary/95 text-primary-foreground'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{activeSession.isCompleted ? 'Marked Completed ✅' : 'Mark Session as Completed'}</span>
          </button>
        </div>
      </div>

      {/* Selector tabs for days if coach scheduled multiple days */}
      {sessions.length > 1 && (
        <div className="flex p-1 rounded-2xl bg-card border border-border overflow-x-auto max-w-2xl scrollbar-none">
          {sessions.map((sess, i) => (
            <button
              key={sess.id}
              onClick={() => {
                setActiveSessionIdx(i);
                stopRestTimer();
              }}
              className={`flex-shrink-0 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSessionIdx === i 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              {sess.dayName}
            </button>
          ))}
        </div>
      )}

      {/* Status banner */}
      <div className="p-6 rounded-3xl bg-secondary/30 border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Assigned Workout Routine</span>
          <h2 className="text-xl font-bold mt-0.5">{activeSession.sessionTitle}</h2>
          <p className="text-xs text-muted-foreground mt-1">Scheduled for: {activeSession.dateAssigned}</p>
        </div>

        {activeSession.exercises.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">Logged Output: {completionPercentage}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{completedSets} / {totalSets} sets checked</p>
          </div>
        )}
      </div>

      {/* Main Logging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Exercises List and Feedback Notes */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeSession.exercises.length === 0 ? (
            <div className="p-16 border border-dashed border-border rounded-[2.5rem] text-center bg-card">
              <p className="font-bold text-lg">Rest Day</p>
              <p className="text-xs text-muted-foreground mt-1">Take time to rest, recover muscles, and hydrate.</p>
            </div>
          ) : (
            activeSession.exercises.map((ex) => (
              <div key={ex.id} className="p-6 rounded-[2rem] bg-card border border-border space-y-5">
                
                {/* Exercise Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{ex.name}</h3>
                      {ex.notes && (
                        <p className="text-[10px] text-primary mt-0.5">💡 {ex.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Media Indicator Suffix */}
                  {ex.mediaType && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary border border-border/80 text-[9px] font-bold text-muted-foreground uppercase">
                      {ex.mediaType === 'library' && <Database size={10} className="text-brand-purple" />}
                      {ex.mediaType === 'upload' && <Video size={10} className="text-brand-blue" />}
                      {ex.mediaType === 'embed' && <Link2 size={10} className="text-emerald-500" />}
                      <span>{ex.mediaType === 'library' ? 'Animation' : ex.mediaType === 'upload' ? 'Upload Demo' : 'External Video'}</span>
                    </div>
                  )}
                </div>

                {/* External Embed or Demo info */}
                {ex.mediaType === 'embed' && ex.embedUrl && (
                  <div className="p-3.5 rounded-2xl bg-secondary/20 border border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Link2 size={14} className="text-primary" />
                      <span>Exercise demonstration available.</span>
                    </div>
                    <a href={ex.embedUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline uppercase text-[10px]">
                      Watch Video →
                    </a>
                  </div>
                )}

                {/* Sets Header */}
                <div className="grid grid-cols-6 gap-2 text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-1 border-b border-border/50">
                  <span className="text-left col-span-1 pl-1">Set</span>
                  <span className="col-span-2">Coach Target</span>
                  <span className="col-span-2">Client Actual Log</span>
                  <span>Done</span>
                </div>

                {/* Sets Rows */}
                <div className="space-y-2">
                  {ex.sets.map((set) => (
                    <div 
                      key={set.setNumber} 
                      className={`grid grid-cols-6 gap-2 items-center text-center p-2 rounded-xl border transition-all ${
                        set.isCompleted 
                          ? 'bg-green-500/5 border-green-500/20 text-foreground' 
                          : 'bg-background border-border/60'
                      }`}
                    >
                      <span className="text-left font-bold text-xs pl-1 col-span-1 text-white">
                        #{set.setNumber}
                      </span>

                      <div className="col-span-2 flex flex-col justify-center text-[10px] text-muted-foreground">
                        <span className="font-bold text-foreground/80">{set.targetReps} reps</span>
                        <span>at {set.targetWeight} kg</span>
                      </div>

                      <div className="col-span-2 grid grid-cols-2 gap-1.5">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.actualReps || ''}
                          onChange={(e) => handleInputChange(ex.id, set.setNumber, 'actualReps', e.target.value)}
                          disabled={set.isCompleted || activeSession.isCompleted}
                          className="w-full px-2 py-1.5 text-center rounded-lg bg-card border border-border text-xs focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <input
                          type="number"
                          placeholder="Weight"
                          value={set.actualWeight || ''}
                          onChange={(e) => handleInputChange(ex.id, set.setNumber, 'actualWeight', e.target.value)}
                          disabled={set.isCompleted || activeSession.isCompleted}
                          className="w-full px-2 py-1.5 text-center rounded-lg bg-card border border-border text-xs focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSetComplete(ex.id, set.setNumber, set.targetRest)}
                          disabled={activeSession.isCompleted}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            set.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                              : 'border-border bg-card hover:bg-secondary/50 disabled:opacity-50'
                          }`}
                        >
                          <Check size={14} className={set.isCompleted ? 'stroke-[3]' : 'text-transparent'} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Client Feedback Notes Area */}
          <div className="p-6 rounded-[2rem] bg-card border border-border space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <FileText size={16} className="text-primary" />
              <span>Feedback & Notes to Coach</span>
            </h3>
            <textarea
              value={activeSession.clientFeedbackNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Report challenges, muscle soreness, or general feedback about this routine to your coach..."
              disabled={activeSession.isCompleted}
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24 text-white disabled:opacity-75"
            />
          </div>

        </div>

        {/* Side Panel: Rest Timer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-card border border-border text-center space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Rest Timer</h3>
            
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center rounded-full border-4 border-secondary">
              {timerActive && (
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    className="stroke-primary fill-none"
                    strokeWidth="4"
                    strokeDasharray={477}
                    strokeDashoffset={477 - (477 * timeLeft) / timerDuration}
                  />
                </svg>
              )}

              <div className="text-center z-10">
                {timerActive ? (
                  <>
                    <p className="text-4xl font-black text-foreground tabular-nums">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1 animate-pulse">Resting...</p>
                  </>
                ) : (
                  <>
                    <Clock className="mx-auto text-muted-foreground/60 mb-1" size={28} />
                    <p className="text-sm font-bold text-muted-foreground">Ready</p>
                  </>
                )}
              </div>
            </div>

            {timerActive ? (
              <button
                onClick={stopRestTimer}
                className="w-full flex items-center justify-center space-x-1.5 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all"
              >
                <RotateCcw size={14} />
                <span>Skip Rest Period</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => startRestTimer(60)}
                  className="py-3 bg-secondary hover:bg-secondary/80 text-xs font-bold rounded-xl border border-border transition-all"
                >
                  60s Rest
                </button>
                <button
                  onClick={() => startRestTimer(90)}
                  className="py-3 bg-secondary hover:bg-secondary/80 text-xs font-bold rounded-xl border border-border transition-all"
                >
                  90s Rest
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
