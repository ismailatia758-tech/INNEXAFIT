'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Paperclip, 
  Plus,
  TrendingUp,
  Dumbbell,
  Utensils,
  ClipboardList,
  Trash2,
  File,
  Droplet,
  Edit2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const progressData = [
  { date: 'May 1', weight: 88 },
  { date: 'May 8', weight: 87.2 },
  { date: 'May 15', weight: 86.5 },
  { date: 'May 22', weight: 85.8 },
  { date: 'May 29', weight: 85 },
];

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'workout' | 'nutrition' | 'history'>('overview');

  const [client, setClient] = useState<any>(null);
  const [latestResponse, setLatestResponse] = useState<any>(null);

  // Expanded details states
  const [expandedWorkoutDayId, setExpandedWorkoutDayId] = useState<string | null>(null);
  const [expandedDietDayId, setExpandedDietDayId] = useState<string | null>(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

  // Client logs states
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([]);
  const [clientDiets, setClientDiets] = useState<any[]>([]);
  const [clientAnswersHistory, setClientAnswersHistory] = useState<any[]>([]);

  // Coach Notes list states
  const [notesList, setNotesList] = useState<any[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states for new/edit note
  const [noteText, setNoteText] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [noteFileBase64, setNoteFileBase64] = useState<string | null>(null);
  const [noteFileName, setNoteFileName] = useState('');

  useEffect(() => {
    const savedClients = localStorage.getItem('coachClients');
    const clientsList = savedClients ? JSON.parse(savedClients) : [];
    const foundClient = clientsList.find((c: any) => c.id === clientId) || clientsList.find((c: any) => c.email === 'john@example.com') || {
      id: 'cli-1',
      name: 'John Doe',
      email: 'john@example.com',
      packageName: 'Premium Muscle Builder',
      status: 'Active',
      startDate: '2026-05-01',
      expiryDate: '2026-08-01',
      username: 'johndoe',
      phone: '+20 123 456 789',
      gender: 'Male',
      age: 28
    };
    
    // Add default body indicators metrics if they are missing
    const enrichedClient = {
      ...foundClient,
      weight: foundClient.weight || 85.0,
      bodyFat: foundClient.bodyFat || 15.4,
      waist: foundClient.waist || 84,
      chest: foundClient.chest || 104,
      height: foundClient.height || 180,
      age: foundClient.age || 28,
      gender: foundClient.gender || 'Male'
    };
    setClient(enrichedClient);

    const savedAnswers = localStorage.getItem('clientQuestionnaireAnswers');
    const allAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
    const clientAnswers = allAnswers.filter((ans: any) => ans.clientEmail.toLowerCase() === enrichedClient.email.toLowerCase());
    
    if (clientAnswers.length > 0) {
      const sorted = clientAnswers.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setLatestResponse(sorted[0]);
    }
  }, [clientId]);

  useEffect(() => {
    if (!client) return;

    // 1. Workouts
    const savedWorkouts = localStorage.getItem('clientActiveWorkouts');
    const allWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : {};
    let workouts = allWorkouts[client.email] || [];
    
    if (workouts.length === 0 && client.email === 'john@example.com') {
      // Seed default mock workouts
      workouts = [
        {
          id: 'mock-w-1',
          dayName: 'Day 1',
          sessionTitle: 'Pull Day (Back & Biceps)',
          dateAssigned: '2026-06-05',
          isCompleted: true,
          clientFeedbackNotes: 'Great session, but lower back felt slightly fatigued during deadlifts.',
          exercises: [
            { id: 'ex-1', name: 'Deadlifts', category: 'Back', sets: [{ setNumber: 1, targetReps: 5, targetWeight: 100, isCompleted: true, actualReps: '5', actualWeight: '100' }, { setNumber: 2, targetReps: 5, targetWeight: 110, isCompleted: true, actualReps: '5', actualWeight: '110' }] },
            { id: 'ex-2', name: 'Bicep Barbell Curls', category: 'Biceps', sets: [{ setNumber: 1, targetReps: 10, targetWeight: 25, isCompleted: true, actualReps: '10', actualWeight: '25' }] }
          ]
        },
        {
          id: 'mock-w-2',
          dayName: 'Day 2',
          sessionTitle: 'Push Day (Chest & Shoulders)',
          dateAssigned: '2026-06-06',
          isCompleted: false,
          clientFeedbackNotes: 'Felt strong, did one extra rep on incline press.',
          exercises: [
            { id: 'ex-3', name: 'Barbell Bench Press', category: 'Chest', sets: [{ setNumber: 1, targetReps: 8, targetWeight: 80, isCompleted: false }] }
          ]
        }
      ];
      allWorkouts[client.email] = workouts;
      localStorage.setItem('clientActiveWorkouts', JSON.stringify(allWorkouts));
    }
    setClientWorkouts(workouts);

    // 2. Diets
    const savedDiets = localStorage.getItem('clientActiveDiets');
    const allDiets = savedDiets ? JSON.parse(savedDiets) : {};
    let diets = allDiets[client.email] || [];

    if (diets.length === 0 && client.email === 'john@example.com') {
      diets = [
        {
          id: 'mock-d-1',
          dayName: 'Day 1',
          sessionTitle: 'High Carb / Training Day',
          dateAssigned: '2026-06-05',
          isCompleted: true,
          clientFeedbackNotes: 'Stuck to all meals, substituted rice with sweet potato at lunch.',
          waterIntake: 8,
          meals: [
            { id: 'm-1', name: 'Breakfast', time: '08:00 AM', isCompleted: true, foods: [{ id: 'f-1', name: 'Oats & Milk', calories: 350 }] },
            { id: 'm-2', name: 'Lunch', time: '01:30 PM', isCompleted: true, foods: [{ id: 'f-2', name: 'Chicken & Rice', calories: 650 }] }
          ]
        },
        {
          id: 'mock-d-2',
          dayName: 'Day 2',
          sessionTitle: 'Low Carb / Rest Day',
          dateAssigned: '2026-06-06',
          isCompleted: false,
          clientFeedbackNotes: 'Felt a bit hungry in the evening but did not cheat.',
          waterIntake: 6,
          meals: [
            { id: 'm-3', name: 'Breakfast', time: '08:00 AM', isCompleted: true, foods: [{ id: 'f-3', name: 'Eggs & Spinach', calories: 280 }] },
            { id: 'm-4', name: 'Dinner', time: '07:30 PM', isCompleted: false, foods: [{ id: 'f-4', name: 'Fish & Broccoli', calories: 400 }] }
          ]
        }
      ];
      allDiets[client.email] = diets;
      localStorage.setItem('clientActiveDiets', JSON.stringify(allDiets));
    }
    setClientDiets(diets);

    // 3. Questionnaires History
    const savedAnswers = localStorage.getItem('clientQuestionnaireAnswers');
    let allAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
    
    if (allAnswers.filter((ans: any) => ans.clientEmail.toLowerCase() === client.email.toLowerCase()).length === 0 && client.email === 'john@example.com') {
      const mockAnswers = [
        {
          id: 'ans-mock-1',
          clientEmail: 'john@example.com',
          clientName: 'John Doe',
          questionnaireId: 'q-1',
          questionnaireTitle: 'Onboarding Questionnaire',
          submittedAt: '2026-05-01T10:00:00.000Z',
          answers: [
            { questionId: 'q-1-1', questionText: 'What is your primary fitness goal?', answer: 'Muscle build and fat loss' },
            { questionId: 'q-1-2', questionText: 'Do you have any prior injuries?', answer: 'Slight knee soreness when lifting very heavy' }
          ]
        },
        {
          id: 'ans-mock-2',
          clientEmail: 'john@example.com',
          clientName: 'John Doe',
          questionnaireId: 'q-2',
          questionnaireTitle: 'Bi-Weekly Progress Update',
          submittedAt: '2026-05-15T10:00:00.000Z',
          answers: [
            { questionId: 'q-2-1', questionText: 'How is your energy level?', answer: '9/10, sleeping much better' },
            { questionId: 'q-2-2', questionText: 'Have you missed any workouts?', answer: 'Missed one leg day due to work travel' }
          ]
        }
      ];
      allAnswers.push(...mockAnswers);
      localStorage.setItem('clientQuestionnaireAnswers', JSON.stringify(allAnswers));
    }

    const clientAnswers = allAnswers.filter((ans: any) => ans.clientEmail.toLowerCase() === client.email.toLowerCase())
      .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setClientAnswersHistory(clientAnswers);

    // Load coach notes list
    const savedNotesList = localStorage.getItem(`coachNotesList_${client.email}`);
    if (savedNotesList) {
      setNotesList(JSON.parse(savedNotesList));
    } else {
      const defaultNotes = [
        {
          id: 'note-default-1',
          text: 'Needs to focus on protein intake during weekends.',
          createdAt: new Date('2026-06-05T10:00:00Z').toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          attachment: null
        },
        {
          id: 'note-default-2',
          text: 'Complains about knee pain during heavy squats.',
          createdAt: new Date('2026-06-06T14:30:00Z').toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          attachment: null
        }
      ];
      setNotesList(defaultNotes);
      localStorage.setItem(`coachNotesList_${client.email}`, JSON.stringify(defaultNotes));
    }
  }, [client]);

  const getInitials = (name: string) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
  };

  // Attachments States
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [viewingAttachment, setViewingAttachment] = useState<any>(null);

  useEffect(() => {
    if (!client) return;
    const savedAtts = localStorage.getItem('clientAttachments');
    let attList: any[] = [];
    if (savedAtts) {
      attList = JSON.parse(savedAtts);
    } else {
      attList = [
        {
          id: 'att-1',
          clientId: client.id,
          name: 'Frontal Progress.jpg',
          size: '2.4 MB',
          date: 'May 28',
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
          fileType: 'image'
        },
        {
          id: 'att-2',
          clientId: client.id,
          name: 'Blood Analysis.pdf',
          size: '1.1 MB',
          date: 'May 15',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'pdf'
        }
      ];
      localStorage.setItem('clientAttachments', JSON.stringify(attList));
    }
    setAttachments(attList.filter(att => att.clientId === client.id));
  }, [client]);

  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !client) {
      toast.error("Please select a file to upload");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const fileType: 'image' | 'pdf' | 'other' = selectedFile.type.startsWith('image/') 
        ? 'image' 
        : selectedFile.type === 'application/pdf' 
        ? 'pdf' 
        : 'other';

      const newAttachment = {
        id: 'att-' + Math.random().toString(36).substr(2, 9),
        clientId: client.id,
        name: customFileName.trim() || selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        url: base64Url,
        fileType: fileType
      };

      const savedAtts = localStorage.getItem('clientAttachments');
      const allAtts = savedAtts ? JSON.parse(savedAtts) : [];
      const updated = [...allAtts, newAttachment];
      localStorage.setItem('clientAttachments', JSON.stringify(updated));

      setAttachments(updated.filter(att => att.clientId === client.id));
      toast.success("File uploaded successfully");
      
      // Reset
      setSelectedFile(null);
      setCustomFileName('');
      setIsUploadOpen(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDeleteAttachment = (id: string, name: string) => {
    const confirmDelete = confirm(`Are you sure you want to delete attachment "${name}"?`);
    if (!confirmDelete) return;

    const savedAtts = localStorage.getItem('clientAttachments');
    const allAtts = savedAtts ? JSON.parse(savedAtts) : [];
    const filtered = allAtts.filter((att: any) => att.id !== id);
    localStorage.setItem('clientAttachments', JSON.stringify(filtered));

    if (client) {
      setAttachments(filtered.filter((att: any) => att.clientId === client.id));
    }
    toast.success("Attachment deleted");
    if (viewingAttachment?.id === id) {
      setViewingAttachment(null);
    }
  };

  const handleNoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNoteFile(file);
    setNoteFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setNoteFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewNote = () => {
    if (!noteText.trim() && !noteFileBase64) {
      toast.error("Please enter text or attach a file");
      return;
    }
    if (!client) return;

    let fileType: 'image' | 'pdf' | 'other' = 'other';
    if (noteFile) {
      fileType = noteFile.type.startsWith('image/') 
        ? 'image' 
        : noteFile.type === 'application/pdf' 
        ? 'pdf' 
        : 'other';
    }

    const newNote = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      text: noteText.trim(),
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      attachment: noteFileBase64 ? {
        name: noteFileName,
        url: noteFileBase64,
        fileType: fileType
      } : null
    };

    const updatedList = [newNote, ...notesList];
    setNotesList(updatedList);
    localStorage.setItem(`coachNotesList_${client.email}`, JSON.stringify(updatedList));
    toast.success("Note added");

    // Reset states
    setNoteText('');
    setNoteFile(null);
    setNoteFileBase64(null);
    setNoteFileName('');
    setIsAddingNote(false);
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!noteText.trim() && !noteFileBase64) {
      toast.error("Note cannot be empty");
      return;
    }
    if (!client) return;

    let fileType: 'image' | 'pdf' | 'other' = 'other';
    if (noteFile) {
      fileType = noteFile.type.startsWith('image/') 
        ? 'image' 
        : noteFile.type === 'application/pdf' 
        ? 'pdf' 
        : 'other';
    }

    const updatedList = notesList.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          text: noteText.trim(),
          attachment: noteFileBase64 ? {
            name: noteFileName,
            url: noteFileBase64,
            fileType: fileType
          } : note.attachment
        };
      }
      return note;
    });

    setNotesList(updatedList);
    localStorage.setItem(`coachNotesList_${client.email}`, JSON.stringify(updatedList));
    toast.success("Note updated");

    // Reset states
    setNoteText('');
    setNoteFile(null);
    setNoteFileBase64(null);
    setNoteFileName('');
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    if (!client) return;

    const updatedList = notesList.filter((note) => note.id !== noteId);
    setNotesList(updatedList);
    localStorage.setItem(`coachNotesList_${client.email}`, JSON.stringify(updatedList));
    toast.success("Note deleted");
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/coach/clients" className="flex items-center text-muted-foreground hover:text-foreground group">
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Clients
        </Link>
        <div className="flex space-x-2">
          <Button variant="destructive">Suspend Access</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-2xl">
            <div className="h-24 bg-gradient-to-r from-brand-purple to-brand-blue" />
            <CardContent className="pt-0 -mt-12 text-center pb-8">
              <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary mx-auto mb-4 flex items-center justify-center text-3xl font-bold overflow-hidden shadow-xl">
                 {getInitials(client?.name || 'John Doe')}
              </div>
              <h2 className="text-2xl font-bold">{client?.name || 'John Doe'}</h2>
              <p className="text-sm text-muted-foreground mb-6">Client since {client?.startDate || 'Jan 2026'}</p>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Mail size={16} />
                  <span className="truncate">{client?.email || 'john@example.com'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Phone size={16} />
                  <span>{client?.phone || '+20 123 456 789'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span>Cairo, Egypt</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Subscription</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    (client?.status || 'Active') === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                  }`}>{client?.status || 'Active'}</span>
                </div>
                <p className="text-sm font-bold text-left">{client?.packageName || 'Professional Monthly'}</p>
                <p className="text-xs text-muted-foreground text-left mt-1">Renews on {client?.expiryDate || 'June 12, 2026'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4">
             <div className="flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center">
                   <FileText size={18} className="mr-2 text-brand-purple" />
                   Coach Notes
                </h3>
                {!isAddingNote && !editingNoteId && (
                  <button 
                    onClick={() => {
                      setNoteText('');
                      setNoteFile(null);
                      setNoteFileBase64(null);
                      setNoteFileName('');
                      setIsAddingNote(true);
                    }}
                    className="p-1 hover:text-brand-purple transition-colors text-muted-foreground"
                    title="Add Note"
                  >
                    <Plus size={18} />
                  </button>
                )}
             </div>

             {/* Add/Edit Note Form */}
             {(isAddingNote || editingNoteId) && (
               <div className="space-y-3 p-4 rounded-2xl bg-background border border-border/80">
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                   {editingNoteId ? 'Edit Note' : 'Add New Note'}
                 </h4>
                 <textarea
                   value={noteText}
                   onChange={(e) => setNoteText(e.target.value)}
                   rows={3}
                   className="w-full p-2.5 text-xs bg-secondary/20 border border-border rounded-xl text-white outline-none focus:ring-2 focus:ring-primary/20"
                   placeholder="Enter note details..."
                 />
                 
                 {/* Attachment Section */}
                 <div className="space-y-1">
                   <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                     Attachment (Optional)
                   </label>
                   <input
                     type="file"
                     accept="image/*,application/pdf"
                     onChange={handleNoteFileChange}
                     className="w-full text-[10px] text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/95 file:cursor-pointer"
                   />
                   {noteFileName && (
                     <p className="text-[10px] text-green-500 font-bold truncate">✓ {noteFileName}</p>
                   )}
                 </div>

                 <div className="flex space-x-2 pt-2 border-t border-border/40">
                   <Button 
                     size="sm" 
                     className="text-[10px] font-bold flex-1"
                     onClick={() => {
                       if (editingNoteId) {
                         handleSaveEditNote(editingNoteId);
                       } else {
                         handleSaveNewNote();
                       }
                     }}
                   >
                     Save
                   </Button>
                   <Button 
                     size="sm" 
                     variant="ghost" 
                     className="text-[10px] font-bold"
                     onClick={() => {
                       setIsAddingNote(false);
                       setEditingNoteId(null);
                       setNoteText('');
                       setNoteFile(null);
                       setNoteFileBase64(null);
                       setNoteFileName('');
                     }}
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             )}

             {/* Notes List */}
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
               {notesList.length === 0 ? (
                 <p className="text-xs text-muted-foreground text-center py-6">
                   No notes added yet. Click the "+" icon to add one.
                 </p>
               ) : (
                 notesList.map((note) => (
                   <div key={note.id} className="p-3.5 rounded-2xl bg-background/50 border border-border/60 hover:border-zinc-800 transition-all space-y-2 relative group">
                     <div className="flex justify-between items-start">
                       <span className="text-[9px] text-zinc-500 font-bold font-mono">
                         {note.createdAt}
                       </span>
                       <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={() => {
                             setEditingNoteId(note.id);
                             setNoteText(note.text);
                             if (note.attachment) {
                               setNoteFileName(note.attachment.name);
                               setNoteFileBase64(note.attachment.url);
                             } else {
                               setNoteFileName('');
                               setNoteFileBase64(null);
                             }
                             setIsAddingNote(false);
                           }}
                           className="text-zinc-500 hover:text-white transition-colors"
                           title="Edit Note"
                         >
                           <Edit2 size={12} />
                         </button>
                         <button
                           onClick={() => handleDeleteNote(note.id)}
                           className="text-zinc-500 hover:text-destructive transition-colors"
                           title="Delete Note"
                         >
                           <Trash2 size={12} />
                         </button>
                       </div>
                     </div>

                     <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                       {note.text}
                     </p>

                     {/* Attachment rendering */}
                     {note.attachment && (
                       <div className="pt-2 border-t border-border/20 flex items-center justify-between gap-2">
                         <div className="flex items-center gap-1.5 min-w-0">
                           <Paperclip size={10} className="text-brand-purple -rotate-45" />
                           <span className="text-[9px] text-zinc-400 font-bold truncate">
                             {note.attachment.name}
                           </span>
                         </div>
                         <a
                           href={note.attachment.url}
                           download={note.attachment.name}
                           target="_blank"
                           rel="noreferrer"
                           className="text-[9px] text-brand-purple hover:underline font-bold flex items-center gap-0.5 flex-shrink-0"
                         >
                           View <ExternalLink size={8} />
                         </a>
                       </div>
                     )}
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex space-x-1 p-1 bg-secondary/50 rounded-2xl w-fit">
            {(['overview', 'workout', 'nutrition', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${
                  activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Current Weight</p>
                    <p className="text-3xl font-black">{client?.weight || 85.0} <span className="text-lg font-medium text-muted-foreground">kg</span></p>
                    <p className="text-xs text-green-500 font-bold mt-2 flex items-center">
                       <TrendingUp size={12} className="mr-1" />
                       -3kg this month
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Workout Adherence</p>
                    <p className="text-3xl font-black">92 <span className="text-lg font-medium text-muted-foreground">%</span></p>
                    <div className="w-full h-1.5 bg-secondary rounded-full mt-4 overflow-hidden">
                       <div className="h-full bg-brand-purple" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Days Logged</p>
                    <p className="text-3xl font-black">28 <span className="text-lg font-medium text-muted-foreground">/ 30</span></p>
                    <p className="text-xs text-muted-foreground font-bold mt-2">Consistent performance</p>
                  </div>
                </div>

                {/* Latest Indicators */}
                <Card className="p-8 border-none bg-gradient-to-br from-zinc-900 via-card to-zinc-950 shadow-xl rounded-[2rem]">
                  <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                    <div>
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Latest Indicators
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Key body measurements and biometrics updated by the client</p>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Weight</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.weight || 85.0} <span className="text-xs font-normal text-muted-foreground">kg</span></span>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Body Fat</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.bodyFat || 15.4} <span className="text-xs font-normal text-muted-foreground">%</span></span>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Waist</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.waist || 84} <span className="text-xs font-normal text-muted-foreground">cm</span></span>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Chest</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.chest || 104} <span className="text-xs font-normal text-muted-foreground">cm</span></span>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Height</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.height || 180} <span className="text-xs font-normal text-muted-foreground">cm</span></span>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col justify-between hover:border-zinc-800 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Age</span>
                        <span className="text-xl font-black mt-2 text-white">{client?.age || 28} <span className="text-xs font-normal text-muted-foreground">yrs</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-8">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl">Weight Progress</CardTitle>
                  </CardHeader>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2rem] bg-card border border-border">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white tracking-tight">Latest Attachments</h3>
                          <button 
                             onClick={() => setIsUploadOpen(true)}
                             className="text-muted-foreground hover:text-white transition-colors p-1"
                          >
                             <Plus size={20} className="stroke-[1.5]" />
                          </button>
                       </div>
                       <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {attachments.length === 0 ? (
                             <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-background/20">
                                <Paperclip size={24} className="mx-auto text-muted-foreground opacity-50 mb-2 -rotate-45" />
                                <p className="text-xs font-bold">No Attachments</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Click the "+" icon above to upload the first file.</p>
                             </div>
                          ) : (
                             attachments.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-4 rounded-[1.25rem] bg-zinc-900/40 border border-zinc-800/80 group hover:border-zinc-700/80 transition-all">
                                   <div 
                                      onClick={() => setViewingAttachment(file)}
                                      className="flex items-center space-x-4 flex-1 cursor-pointer min-w-0"
                                   >
                                      <div className="w-12 h-12 rounded-xl bg-black/60 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors flex-shrink-0">
                                         <Paperclip size={18} className="-rotate-45" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                         <p className="text-sm font-bold text-white tracking-wide truncate pr-2">{file.name}</p>
                                         <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mt-1">{file.size} • {file.date}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center space-x-1">
                                      <button 
                                         className="p-2 text-zinc-400 hover:text-white transition-colors"
                                         onClick={() => setViewingAttachment(file)}
                                         title="Open File"
                                      >
                                         <FileText size={18} className="stroke-[1.75]" />
                                      </button>
                                      <button 
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             handleDeleteAttachment(file.id, file.name);
                                         }}
                                         className="p-2 text-zinc-600 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                         title="Delete Attachment"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </div>
                   <div className="p-8 rounded-[2rem] bg-card border border-border flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold">Latest Questionnaire</h3>
                         {latestResponse && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                               Submitted
                            </span>
                         )}
                      </div>

                      {latestResponse ? (
                         <div className="space-y-4 flex-1">
                            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80">
                               <p className="text-xs text-muted-foreground uppercase font-bold">Title</p>
                               <p className="text-sm font-bold text-white mt-0.5">{latestResponse.questionnaireTitle}</p>
                               <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                  <Calendar size={10} />
                                  <span>Submitted at: {latestResponse.submittedAt.split('T')[0]}</span>
                               </p>
                            </div>

                            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                               {latestResponse.answers.map((ans: any, idx: number) => (
                                  <div key={ans.questionId} className="p-3 rounded-xl bg-background border border-border/40 space-y-1">
                                     <p className="text-[10px] font-black text-primary">Q{idx + 1}: {ans.questionText}</p>
                                     <p className="text-xs text-white bg-card/60 p-2 rounded-lg border border-border/20 font-mono">{ans.answer || '—'}</p>
                                  </div>
                                ))}
                            </div>
                         </div>
                      ) : (
                         <div className="text-center py-10 border border-dashed border-border rounded-3xl bg-background/30 flex-1 flex flex-col justify-center items-center">
                            <ClipboardList size={36} className="text-muted-foreground opacity-50 mb-3" />
                            <p className="text-sm font-bold">No Questionnaire Answered</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">This trainee has not submitted any questionnaires yet.</p>
                         </div>
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workout' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Dumbbell className="text-brand-purple" size={22} />
                    Workout Log
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Consolidated timeline of all assigned workouts, completions, and set-by-set stats</p>
                </div>

                <div className="space-y-4">
                  {clientWorkouts.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-card">
                      <Dumbbell size={36} className="mx-auto text-muted-foreground opacity-50 mb-3" />
                      <p className="text-sm font-bold">No Workouts Assigned</p>
                      <p className="text-xs text-muted-foreground mt-1">This client does not have any active or past workouts yet.</p>
                    </div>
                  ) : (
                    clientWorkouts.map((workout: any) => {
                      const isExpanded = expandedWorkoutDayId === workout.id;
                      return (
                        <div key={workout.id} className="p-6 rounded-[2rem] bg-card border border-border hover:border-zinc-800 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-brand-purple/20 text-brand-purple border border-brand-purple/20 px-2.5 py-0.5 rounded-full font-bold uppercase">
                                  {workout.dayName}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                  workout.isCompleted 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                  {workout.isCompleted ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white mt-1.5">{workout.sessionTitle}</h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar size={12} />
                                Assigned: {workout.dateAssigned}
                              </p>
                            </div>

                            <button
                              onClick={() => setExpandedWorkoutDayId(isExpanded ? null : workout.id)}
                              className="px-4 py-2 bg-secondary hover:bg-secondary/80 hover:text-white text-xs font-bold rounded-xl transition-all border border-border"
                            >
                              {isExpanded ? 'Hide Details' : 'View Exercises & Sets Log'}
                            </button>
                          </div>

                          {workout.clientFeedbackNotes && (
                            <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-border/40 text-xs">
                              <span className="font-bold text-zinc-500 uppercase tracking-wide block mb-1">Trainee Feedback:</span>
                              <p className="text-zinc-200 italic">"{workout.clientFeedbackNotes}"</p>
                            </div>
                          )}

                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-border space-y-4">
                              {workout.exercises.map((ex: any) => (
                                <div key={ex.id} className="p-4 rounded-2xl bg-zinc-950 border border-border/40">
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                                    <span className="text-[10px] bg-zinc-900 border border-border/20 text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                      {ex.category}
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="border-b border-border/30 text-muted-foreground">
                                          <th className="pb-2 font-bold uppercase">Set</th>
                                          <th className="pb-2 font-bold uppercase">Target Reps</th>
                                          <th className="pb-2 font-bold uppercase">Target Weight</th>
                                          <th className="pb-2 font-bold uppercase">Actual Reps (Logged)</th>
                                          <th className="pb-2 font-bold uppercase">Actual Weight (Logged)</th>
                                          <th className="pb-2 font-bold uppercase text-right">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {ex.sets.map((set: any) => (
                                          <tr key={set.setNumber} className="border-b border-border/10 last:border-0 hover:bg-zinc-900/40">
                                            <td className="py-2.5 text-zinc-300 font-bold">Set {set.setNumber}</td>
                                            <td className="py-2.5 text-zinc-300">{set.targetReps} reps</td>
                                            <td className="py-2.5 text-zinc-300">{set.targetWeight} kg</td>
                                            <td className="py-2.5 text-white font-mono">{set.actualReps || '—'}</td>
                                            <td className="py-2.5 text-white font-mono">{set.actualWeight ? `${set.actualWeight} kg` : '—'}</td>
                                            <td className="py-2.5 text-right">
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                set.isCompleted 
                                                  ? 'bg-green-500/10 text-green-500' 
                                                  : 'bg-zinc-800 text-zinc-500'
                                              }`}>
                                                {set.isCompleted ? 'Done' : 'Not Done'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'nutrition' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Utensils className="text-brand-blue" size={22} />
                    Nutrition Log
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Timeline of assigned diet plans, daily meal checklists, and water logs</p>
                </div>

                <div className="space-y-4">
                  {clientDiets.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-card">
                      <Utensils size={36} className="mx-auto text-muted-foreground opacity-50 mb-3" />
                      <p className="text-sm font-bold">No Nutrition Plans Assigned</p>
                      <p className="text-xs text-muted-foreground mt-1">This client does not have any active or past nutrition plans yet.</p>
                    </div>
                  ) : (
                    clientDiets.map((diet: any) => {
                      const isExpanded = expandedDietDayId === diet.id;
                      return (
                        <div key={diet.id} className="p-6 rounded-[2rem] bg-card border border-border hover:border-zinc-800 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-brand-blue/20 text-brand-blue border border-brand-blue/20 px-2.5 py-0.5 rounded-full font-bold uppercase">
                                  {diet.dayName}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                  diet.isCompleted 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                  {diet.isCompleted ? 'Completed' : 'Incomplete'}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white mt-1.5">{diet.sessionTitle}</h3>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-4 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar size={12} /> Assigned: {diet.dateAssigned}</span>
                                <span className="flex items-center gap-1 text-blue-400 font-bold">
                                  <Droplet size={12} className="fill-blue-500/20" /> 
                                  Water Intake: {diet.waterIntake || 0} / 10 glasses
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setExpandedDietDayId(isExpanded ? null : diet.id)}
                              className="px-4 py-2 bg-secondary hover:bg-secondary/80 hover:text-white text-xs font-bold rounded-xl transition-all border border-border"
                            >
                              {isExpanded ? 'Hide Details' : 'View Meals & Food Items'}
                            </button>
                          </div>

                          {diet.clientFeedbackNotes && (
                            <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-border/40 text-xs">
                              <span className="font-bold text-zinc-500 uppercase tracking-wide block mb-1">Trainee Feedback:</span>
                              <p className="text-zinc-200 italic">"{diet.clientFeedbackNotes}"</p>
                            </div>
                          )}

                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-border">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {diet.meals.map((meal: any) => (
                                  <div key={meal.id} className="p-4 rounded-2xl bg-zinc-950 border border-border/40 flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-bold text-sm text-white">{meal.name}</h4>
                                        <span className="text-[10px] text-zinc-500 font-bold">{meal.time}</span>
                                      </div>
                                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                        meal.isCompleted 
                                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                          : 'bg-zinc-900 text-zinc-500 border-border/10'
                                      }`}>
                                        {meal.isCompleted ? 'Eaten / تم الأكل' : 'Missed / لم يؤكل'}
                                      </span>
                                    </div>
                                    <div className="space-y-2 border-t border-border/20 pt-2">
                                      {meal.foods?.map((food: any) => (
                                        <div key={food.id} className="flex justify-between text-xs text-zinc-300">
                                          <span>{food.name}</span>
                                          <span className="font-bold text-zinc-500">{food.calories} kcal</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Subscriptions History */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-brand-purple" size={22} />
                      Subscription History
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Overview of all active and past packages registered by the trainee</p>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="pb-3 font-bold uppercase">Package Name</th>
                            <th className="pb-3 font-bold uppercase">Start Date</th>
                            <th className="pb-3 font-bold uppercase">Expiry Date</th>
                            <th className="pb-3 font-bold uppercase">Price</th>
                            <th className="pb-3 font-bold uppercase">Duration</th>
                            <th className="pb-3 font-bold uppercase">Devices</th>
                            <th className="pb-3 font-bold uppercase text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              id: 'sub-1',
                              packageName: client?.packageName || 'Premium Muscle Builder',
                              status: client?.status || 'Active',
                              startDate: client?.startDate || '2026-05-01',
                              expiryDate: client?.expiryDate || '2026-08-01',
                              price: '150 EGP',
                              duration: '3 Months',
                              devicesLimit: '3 Devices'
                            },
                            {
                              id: 'sub-2',
                              packageName: 'Quick Fat Loss Trial',
                              status: 'Expired',
                              startDate: '2026-04-01',
                              expiryDate: '2026-05-01',
                              price: '50 EGP',
                              duration: '1 Month',
                              devicesLimit: '1 Device'
                            }
                          ].map((sub) => (
                            <tr key={sub.id} className="border-b border-border/40 last:border-0 hover:bg-zinc-900/10 transition-colors">
                              <td className="py-4 font-bold text-white">{sub.packageName}</td>
                              <td className="py-4 text-zinc-300">{sub.startDate}</td>
                              <td className="py-4 text-zinc-300">{sub.expiryDate}</td>
                              <td className="py-4 text-zinc-300 font-bold">{sub.price}</td>
                              <td className="py-4 text-zinc-300">{sub.duration}</td>
                              <td className="py-4 text-zinc-400">{sub.devicesLimit}</td>
                              <td className="py-4 text-right">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                                  sub.status === 'Active' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-zinc-800 text-zinc-500 border-border/10'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Questionnaire History */}
                <div className="space-y-4 pt-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ClipboardList className="text-brand-blue" size={22} />
                      Questionnaire History
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Collapsible view of all past and current questionnaires filled out by the client</p>
                  </div>

                  <div className="space-y-4">
                    {clientAnswersHistory.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-border rounded-3xl bg-card">
                        <ClipboardList size={36} className="text-muted-foreground opacity-50 mb-3 mx-auto" />
                        <p className="text-sm font-bold">No Questionnaire Submissions</p>
                      </div>
                    ) : (
                      clientAnswersHistory.map((qHistory) => {
                        const isSelected = selectedQuestionnaireId === qHistory.id;
                        return (
                          <div key={qHistory.id} className="p-6 rounded-[2rem] bg-card border border-border hover:border-zinc-800 transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                                    Submitted
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-white mt-1.5">{qHistory.questionnaireTitle}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <Calendar size={12} />
                                  Submitted on: {qHistory.submittedAt.split('T')[0]}
                                </p>
                              </div>

                              <button
                                onClick={() => setSelectedQuestionnaireId(isSelected ? null : qHistory.id)}
                                className="px-4 py-2 bg-secondary hover:bg-secondary/80 hover:text-white text-xs font-bold rounded-xl transition-all border border-border"
                              >
                                {isSelected ? 'Hide Answers' : 'View Full Q&A'}
                              </button>
                            </div>

                            {isSelected && (
                              <div className="mt-6 pt-6 border-t border-border space-y-4">
                                <div className="space-y-3">
                                  {qHistory.answers.map((ans: any, idx: number) => (
                                    <div key={ans.questionId} className="p-4 rounded-2xl bg-zinc-950 border border-border/40 space-y-1">
                                      <p className="text-xs font-black text-primary">Q{idx + 1}: {ans.questionText}</p>
                                      <p className="text-xs text-white bg-card/60 p-3 rounded-xl border border-border/20 font-mono mt-1.5 whitespace-pre-wrap">{ans.answer || '—'}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox / Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/20">
              <div>
                <h3 className="font-bold text-lg text-white truncate max-w-md">{viewingAttachment.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase">{viewingAttachment.size} • {viewingAttachment.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={viewingAttachment.url} 
                  download={viewingAttachment.name}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download File
                </a>
                <button
                  onClick={() => setViewingAttachment(null)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto bg-background/50 flex items-center justify-center min-h-[300px]">
              {viewingAttachment.fileType === 'image' ? (
                <img 
                  src={viewingAttachment.url} 
                  alt={viewingAttachment.name} 
                  className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-border/40 shadow-lg"
                />
              ) : viewingAttachment.fileType === 'pdf' ? (
                <iframe 
                  src={viewingAttachment.url} 
                  title={viewingAttachment.name}
                  className="w-full h-[60vh] rounded-2xl border border-border/40 bg-white"
                />
              ) : (
                <div className="text-center py-12">
                  <File size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="font-bold text-sm">Cannot preview this file type inside the browser</p>
                  <p className="text-xs text-muted-foreground mt-1">Please download the file using the button above to view it.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Attachment Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-2">Upload Client Attachment</h2>
            <p className="text-xs text-muted-foreground mb-6">Select an image, photo, or PDF report to store securely under this trainee's hub.</p>

            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Custom Attachment Name (Optional)</label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="e.g. Squats Knee Posture, Blood Report May"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select File *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-2">Supports PNG, JPG, JPEG, and PDF documents (Max 5MB).</p>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setCustomFileName('');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40"
                >
                  Upload File
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
