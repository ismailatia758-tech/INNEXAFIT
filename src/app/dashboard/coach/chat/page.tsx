'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  User, 
  Scale, 
  Activity, 
  Calendar, 
  ChevronRight, 
  FileText, 
  TrendingUp, 
  MoreVertical,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Message {
  id: string;
  sender: 'coach' | 'trainee';
  text: string;
  time: string;
}

interface Trainee {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  currentWeight: string;
  height: string;
  targetWeight: string;
  bodyFat: string;
  planStatus: string;
  lastCheckIn: string;
  messages: Message[];
}

const initialTrainees: Trainee[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'J',
    goal: 'Fat Loss',
    currentWeight: '84.8 kg',
    height: '180 cm',
    targetWeight: '80.0 kg',
    bodyFat: '19.5%',
    planStatus: 'Active (Meal Plan A, Workout Week 3)',
    lastCheckIn: 'Yesterday (Mon)',
    messages: [
      { id: '1', sender: 'trainee', text: 'Hey Coach! I just uploaded my weight check-in. Dropped another 0.7kg!', time: 'Yesterday 5:30 PM' },
      { id: '2', sender: 'coach', text: 'Excellent progress, John! How are your energy levels on the current meal plan?', time: 'Yesterday 6:00 PM' },
      { id: '3', sender: 'trainee', text: 'Levels are good, but I feel slightly hungry around 4 PM before my workout.', time: 'Yesterday 6:15 PM' },
      { id: '4', sender: 'coach', text: 'Let\'s add 30g of oats to your pre-workout meal. I\'ll update your plan right away.', time: 'Yesterday 6:30 PM' },
      { id: '5', sender: 'trainee', text: 'Awesome! Thanks coach. I will try that today.', time: '10m ago' },
    ]
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    avatar: 'S',
    goal: 'Muscle Gain',
    currentWeight: '61.5 kg',
    height: '168 cm',
    targetWeight: '63.0 kg',
    bodyFat: '18.1%',
    planStatus: 'Active (Bulking Plan V1, Hypertrophy W5)',
    lastCheckIn: '3 days ago',
    messages: [
      { id: '1', sender: 'coach', text: 'Hi Sarah, how are your lifts going this week? Did you hit the target weights on squat?', time: '2 days ago' },
      { id: '2', sender: 'trainee', text: 'Yes! Squatted 70kg for 3 sets of 8 reps! Felt very solid.', time: '2 days ago' },
      { id: '3', sender: 'coach', text: 'Amazing job! We will increase the target to 72.5kg next week.', time: '2 days ago' }
    ]
  },
  {
    id: '3',
    name: 'Mike Ross',
    avatar: 'M',
    goal: 'Strength Build',
    currentWeight: '76.8 kg',
    height: '175 cm',
    targetWeight: '75.0 kg',
    bodyFat: '14.8%',
    planStatus: 'Pending Plan Update',
    lastCheckIn: '5 days ago',
    messages: [
      { id: '1', sender: 'trainee', text: 'Coach, I am having some issues with my shoulder during bench press.', time: '3 days ago' },
      { id: '2', sender: 'coach', text: 'Let\'s replace the barbell bench press with dumbbell press for a week to check.', time: '3 days ago' }
    ]
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'E',
    goal: 'Fat Loss',
    currentWeight: '65.2 kg',
    height: '162 cm',
    targetWeight: '60.0 kg',
    bodyFat: '22.1%',
    planStatus: 'Active (Meal Plan B, Toning W2)',
    lastCheckIn: 'Today 8:00 AM',
    messages: [
      { id: '1', sender: 'trainee', text: 'Sent you my progress photos for week 4!', time: '1h ago' }
    ]
  }
];

export default function ChatPage() {
  const [traineesList, setTraineesList] = useState<Trainee[]>([]);
  const [activeTraineeId, setActiveTraineeId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTraineeDetails, setShowTraineeDetails] = useState(true);

  // Load trainees and set active
  const fetchTrainees = async () => {
    try {
      const res = await api.get('/coach/clients');
      const formatted: Trainee[] = await Promise.all(res.data.map(async (c: any) => {
        let messages: Message[] = [];
        try {
          const msgRes = await api.get(`/messages/${c.id}`);
          messages = msgRes.data.map((m: any) => ({
            id: m.id,
            sender: m.sender === 'client' ? 'trainee' : 'coach',
            text: m.text,
            time: m.timestamp
          }));
        } catch (err) {
          console.error(`Failed to load messages for client ${c.id}`, err);
        }

        return {
          id: c.id,
          name: c.name,
          avatar: c.name.charAt(0).toUpperCase(),
          goal: c.planType || 'General fitness',
          currentWeight: 'N/A',
          height: 'N/A',
          targetWeight: 'N/A',
          bodyFat: 'N/A',
          planStatus: c.status || 'Active',
          lastCheckIn: c.startDate || 'N/A',
          messages
        };
      }));

      setTraineesList(formatted);
      if (formatted.length > 0 && !activeTraineeId) {
        setActiveTraineeId(formatted[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch trainees from backend, loading fallback', err);
      setTraineesList(initialTrainees);
      if (!activeTraineeId) setActiveTraineeId('1');
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  // Poll for messages of active trainee periodically
  useEffect(() => {
    if (!activeTraineeId) return;

    const interval = setInterval(async () => {
      try {
        const msgRes = await api.get(`/messages/${activeTraineeId}`);
        const newMsgs = msgRes.data.map((m: any) => ({
          id: m.id,
          sender: m.sender === 'client' ? 'trainee' : 'coach',
          text: m.text,
          time: m.timestamp
        }));

        setTraineesList(prev => prev.map(t => {
          if (t.id === activeTraineeId) {
            return { ...t, messages: newMsgs };
          }
          return t;
        }));
      } catch (err) {
        console.error('Failed to reload messages', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTraineeId]);

  const activeTrainee = traineesList.find(t => t.id === activeTraineeId) || traineesList[0] || {
    id: '',
    name: 'No Trainee',
    avatar: '?',
    goal: '',
    currentWeight: '',
    height: '',
    targetWeight: '',
    bodyFat: '',
    planStatus: '',
    lastCheckIn: '',
    messages: []
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTrainee?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTraineeId) return;

    const currentText = inputText.trim();
    setInputText('');

    try {
      await api.post('/messages', { receiverId: activeTraineeId, text: currentText });
      const msgRes = await api.get(`/messages/${activeTraineeId}`);
      const newMsgs = msgRes.data.map((m: any) => ({
        id: m.id,
        sender: m.sender === 'client' ? 'trainee' : 'coach',
        text: m.text,
        time: m.timestamp
      }));

      setTraineesList(prev => prev.map(t => {
        if (t.id === activeTraineeId) {
          return { ...t, messages: newMsgs };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to send message to backend, using local fallback', err);
      const newMessage: Message = {
        id: String(activeTrainee.messages.length + 1),
        sender: 'coach',
        text: currentText,
        time: 'Just now'
      };

      setTraineesList(prev => prev.map(t => {
        if (t.id === activeTraineeId) {
          return { ...t, messages: [...t.messages, newMessage] };
        }
        return t;
      }));
    }
  };

  const filteredTrainees = traineesList.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[500px] flex rounded-3xl bg-card border border-border overflow-hidden">
      {/* Contact List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search trainees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredTrainees.map((trainee) => {
            const isActive = trainee.id === activeTraineeId;
            const lastMsg = trainee.messages[trainee.messages.length - 1];

            return (
              <button
                key={trainee.id}
                onClick={() => setActiveTraineeId(trainee.id)}
                className={`w-full text-left p-4 transition-all flex items-center space-x-3 ${
                  isActive ? 'bg-secondary/70 border-r-2 border-primary' : 'hover:bg-secondary/30'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {trainee.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold truncate">{trainee.name}</span>
                    {lastMsg && <span className="text-[9px] text-muted-foreground whitespace-nowrap">{lastMsg.time}</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                    {lastMsg ? lastMsg.text : 'No messages'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex-1 flex flex-col bg-background/20">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border bg-card/30 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {activeTrainee.avatar}
            </div>
            <div>
              <h3 className="text-sm font-bold">{activeTrainee.name}</h3>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTraineeDetails(!showTraineeDetails)}
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              showTraineeDetails ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            <span>Trainee Info</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/5">
          {activeTrainee.messages.map((msg) => {
            const isCoach = msg.sender === 'coach';

            return (
              <div 
                key={msg.id} 
                className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isCoach 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-card border border-border text-foreground rounded-tl-none'
                }`}>
                  <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[9px] block mt-1.5 ${isCoach ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/30 flex space-x-2">
          <input
            type="text"
            placeholder={`Message ${activeTrainee.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button 
            type="submit"
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Right Sidebar Trainee Details (Data Integration) */}
      <AnimatePresence>
        {showTraineeDetails && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '20rem', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-l border-border bg-card/50 overflow-hidden w-80 h-full"
          >
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Profile card */}
              <div className="text-center pb-6 border-b border-border/60">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary mb-3">
                  {activeTrainee.avatar}
                </div>
                <h3 className="font-bold text-sm">{activeTrainee.name}</h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">{activeTrainee.goal}</span>
              </div>

              {/* Physical Statistics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border text-center">
                    <Scale size={14} className="mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-muted-foreground font-bold">Weight</p>
                    <p className="font-bold text-xs mt-0.5">{activeTrainee.currentWeight}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border text-center">
                    <TrendingUp size={14} className="mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-muted-foreground font-bold">Body Fat</p>
                    <p className="font-bold text-xs mt-0.5">{activeTrainee.bodyFat}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border text-center">
                    <User size={14} className="mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-muted-foreground font-bold">Height</p>
                    <p className="font-bold text-xs mt-0.5">{activeTrainee.height}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border text-center">
                    <Activity size={14} className="mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-muted-foreground font-bold">Goal Weight</p>
                    <p className="font-bold text-xs mt-0.5">{activeTrainee.targetWeight}</p>
                  </div>
                </div>
              </div>

              {/* Workout Plan Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Routine</h4>
                <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <p className="text-xs font-bold leading-relaxed">{activeTrainee.planStatus}</p>
                  <p className="text-[10px] text-muted-foreground">Last Check-in: {activeTrainee.lastCheckIn}</p>
                </div>
              </div>

              {/* Data integration CTAs */}
              <div className="space-y-2 pt-4 border-t border-border/60">
                <Link href="/dashboard/coach/progress">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold border border-border text-left transition-all">
                    <span className="flex items-center space-x-2">
                      <FileText size={14} />
                      <span>View Progress Reports</span>
                    </span>
                    <ChevronRight size={12} />
                  </button>
                </Link>
                <Link href="/dashboard/coach/workouts">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold border border-border text-left transition-all">
                    <span className="flex items-center space-x-2">
                      <Activity size={14} />
                      <span>Edit Trainee Plan</span>
                    </span>
                    <ChevronRight size={12} />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
