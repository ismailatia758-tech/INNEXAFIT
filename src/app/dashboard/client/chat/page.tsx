'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  MessageSquare,
  Sparkles,
  Smartphone,
  Info,
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Message {
  id: string;
  sender: 'client' | 'coach';
  text: string;
  timestamp: string;
}

const mockCoachReplies = [
  "Hey! Great work on your training today. Did you manage to drink all your water target too?",
  "Perfect. I checked your weight log trend—looking steady. Remember to fill in the weekly report today so I can adjust your macros if needed!",
  "Awesome, keep pushing! Make sure you take full 90-second rests between those heavy bench sets.",
  "Hey! I noticed you checked off your meals today. Good job on hitting the protein target. Let's keep it going!"
];

export default function ClientChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [coachId, setCoachId] = useState<string | null>(null);

  // Load chat from API or fallback to localStorage
  useEffect(() => {
    const initChat = async () => {
      try {
        const coachRes = await api.get('/client/coach');
        const coach = coachRes.data;
        setCoachId(coach.id);

        const msgRes = await api.get(`/messages/${coach.id}`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Failed to initialize chat from backend, loading fallback', err);
        const saved = localStorage.getItem('clientCoachMessages');
        if (saved) {
          setMessages(JSON.parse(saved));
        } else {
          setMessages([]);
        }
      }
    };

    initChat();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInputValue = inputValue.trim();
    setInputValue('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      sender: 'client',
      text: currentInputValue,
      timestamp: timeStr
    };

    if (coachId) {
      try {
        await api.post('/messages', { receiverId: coachId, text: currentInputValue });
        const msgRes = await api.get(`/messages/${coachId}`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Failed to send message to backend, using local fallback', err);
        const updated = [...messages, userMsg];
        setMessages(updated);
        localStorage.setItem('clientCoachMessages', JSON.stringify(updated));
      }
    } else {
      const updated = [...messages, userMsg];
      setMessages(updated);
      localStorage.setItem('clientCoachMessages', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coach Support Chat</h1>
        <p className="text-muted-foreground mt-2">Chat directly with your coach and get immediate assistance on your plans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start h-[calc(100vh-14rem)] min-h-[500px]">
        
        {/* Left column: Coach details widget */}
        <div className="lg:col-span-1 p-6 rounded-[2rem] bg-card border border-border space-y-6 h-full flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">My Instructor</h3>

            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-3xl font-black mx-auto relative">
                C
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div>
                <h4 className="font-bold text-base">Coach Innexa</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Personal Fitness Trainer</p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-background border border-border/60 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response rate:</span>
                <span className="font-bold text-foreground">Under 1 hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-green-500 flex items-center gap-1">
                  <span>Available</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-[10px] text-muted-foreground leading-relaxed flex gap-2">
            <Info size={16} className="text-primary flex-shrink-0" />
            <p>Our mock messaging uses client-side state storage. Any conversation logged here stays private inside your browser instance.</p>
          </div>
        </div>

        {/* Right column: Chat workspace */}
        <div className="lg:col-span-3 rounded-[2.5rem] bg-card border border-border h-full flex flex-col overflow-hidden shadow-sm">
          {/* Chat Workspace Header */}
          <div className="p-5 border-b border-border/60 flex items-center justify-between bg-secondary/20">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                C
              </div>
              <div>
                <h3 className="font-bold text-sm">Coach Support Channel</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Direct line to Coach Innexa</p>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isClient = msg.sender === 'client';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[75%] ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                      isClient ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}>
                      {isClient ? 'Me' : 'C'}
                    </div>

                    <div className="space-y-1">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isClient 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-secondary/60 text-foreground rounded-tl-none border border-border/60'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 text-[9px] text-muted-foreground uppercase ${
                        isClient ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isClient && <CheckCheck size={10} className="text-primary/70 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[75%] items-center">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-secondary text-foreground font-bold text-xs">
                    C
                  </div>
                  <div className="p-3 bg-secondary/40 border border-border/40 rounded-2xl rounded-tl-none flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border/60 bg-secondary/20 flex space-x-2">
            <input
              type="text"
              placeholder="Type your message to coach here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3.5 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
            <button
              type="submit"
              className="px-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center"
            >
              <Send size={14} className="stroke-[2.5]" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
