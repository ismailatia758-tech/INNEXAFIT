'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle, 
  Users, 
  List, 
  Star, 
  AlignLeft, 
  Calendar,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/store/useLanguage';
import { useAuth } from '@/store/useAuth';

interface Question {
  id: string;
  type: 'text' | 'choice' | 'rating';
  text: string;
  options: string[]; // only for choice
}

interface Questionnaire {
  id: string;
  coachEmail: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

interface AnswerDetail {
  questionId: string;
  questionText: string;
  answer: string;
}

interface QuestionnaireResponse {
  id: string;
  clientEmail: string;
  clientName: string;
  questionnaireId: string;
  questionnaireTitle: string;
  answers: AnswerDetail[];
  submittedAt: string;
}

export default function QuestionnairesPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'manage' | 'answers'>('manage');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);

  // Questionnaire Builder States
  const [newTitle, setNewTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Questionnaire Distribution States
  const [clients, setClients] = useState<any[]>([]);
  const [selectedQnaireForSend, setSelectedQnaireForSend] = useState<Questionnaire | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);

  // Expanded Response ID Tracker
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  // Load data from localStorage
  const loadData = () => {
    if (!user?.email) return;

    // Load questionnaires
    const savedQs = localStorage.getItem('platformQuestionnaires');
    const allQs: Questionnaire[] = savedQs ? JSON.parse(savedQs) : [];
    // Filter for current coach
    const coachQs = allQs.filter(q => q.coachEmail.toLowerCase() === user.email.toLowerCase());
    setQuestionnaires(coachQs);

    // Load answers/responses
    const savedAnswers = localStorage.getItem('clientQuestionnaireAnswers');
    const allAnswers: QuestionnaireResponse[] = savedAnswers ? JSON.parse(savedAnswers) : [];
    
    // We can match responses of clients that are coached by this coach
    const savedClients = localStorage.getItem('coachClients');
    const myClients = savedClients ? JSON.parse(savedClients) : [];
    setClients(myClients);
    const myClientEmails = new Set(myClients.map((c: any) => c.email.toLowerCase()));

    // Filter responses to show only responses from this coach's clients
    const coachAnswers = allAnswers.filter(ans => myClientEmails.has(ans.clientEmail.toLowerCase()));
    setResponses(coachAnswers);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Question manipulation
  const addQuestion = (type: 'text' | 'choice' | 'rating') => {
    const newQ: Question = {
      id: 'q-' + Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      options: type === 'choice' ? ['', ''] : []
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  // Multiple Choice Option Handling
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  // Save new Questionnaire
  const handleSaveQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!newTitle.trim()) {
      toast.error(isEn ? 'Please enter a questionnaire title' : 'يرجى إدخال عنوان للاستبيان');
      return;
    }

    if (questions.length === 0) {
      toast.error(isEn ? 'Please add at least one question' : 'يرجى إضافة سؤال واحد على الأقل');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toast.error(isEn ? `Question #${i + 1} is empty` : `السؤال رقم ${i + 1} فارغ`);
        return;
      }
      if (questions[i].type === 'choice') {
        const validOptions = questions[i].options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          toast.error(isEn 
            ? `Question #${i + 1} requires at least 2 choice options` 
            : `السؤال رقم ${i + 1} يتطلب خيارين على الأقل`
          );
          return;
        }
        questions[i].options = validOptions;
      }
    }

    const newQnaire: Questionnaire = {
      id: 'qnaire-' + Math.random().toString(36).substr(2, 9),
      coachEmail: user.email,
      title: newTitle.trim(),
      questions,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Load all from storage, append and save
    const savedQs = localStorage.getItem('platformQuestionnaires');
    const allQs: Questionnaire[] = savedQs ? JSON.parse(savedQs) : [];
    const updatedQs = [...allQs, newQnaire];
    localStorage.setItem('platformQuestionnaires', JSON.stringify(updatedQs));

    // Audit Log Entry
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action: `Coach ${user.name || user.email} created a new questionnaire: "${newTitle.trim()}"`,
      timestamp: new Date().toISOString(),
      type: 'success'
    };
    const savedLogs = localStorage.getItem('platformAuditLogs');
    const auditLogs = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

    toast.success(isEn ? 'Questionnaire created successfully!' : 'تم حفظ الاستبيان بنجاح!');
    
    // Reset States
    setNewTitle('');
    setQuestions([]);
    setIsCreating(false);
    loadData();
  };

  // Delete Questionnaire
  const handleDeleteQuestionnaire = (id: string, title: string) => {
    const confirmDelete = confirm(isEn 
      ? `Are you sure you want to delete "${title}"?` 
      : `هل أنت متأكد من حذف الاستبيان "${title}"؟`
    );
    if (!confirmDelete) return;

    const savedQs = localStorage.getItem('platformQuestionnaires');
    const allQs: Questionnaire[] = savedQs ? JSON.parse(savedQs) : [];
    const filtered = allQs.filter(q => q.id !== id);
    localStorage.setItem('platformQuestionnaires', JSON.stringify(filtered));

    toast.success(isEn ? 'Questionnaire deleted' : 'تم حذف الاستبيان');
    loadData();
  };

  // Send Questionnaire to multiple clients
  const handleSendToClients = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQnaireForSend || selectedClientEmails.length === 0) {
      toast.error(isEn ? 'Please select at least one trainee' : 'يرجى اختيار متدرب واحد على الأقل');
      return;
    }

    // Load all clients
    const savedClients = localStorage.getItem('coachClients');
    const allClients = savedClients ? JSON.parse(savedClients) : [];
    
    // Update targeted clients
    const emailsToLock = new Set(selectedClientEmails.map(e => e.toLowerCase()));
    const updatedClients = allClients.map((c: any) => {
      if (emailsToLock.has(c.email.toLowerCase())) {
        return {
          ...c,
          isLocked: true,
          activeQuestionnaireId: selectedQnaireForSend.id
        };
      }
      return c;
    });

    localStorage.setItem('coachClients', JSON.stringify(updatedClients));

    // Audit logs
    selectedClientEmails.forEach(clientEmail => {
      const traineeName = allClients.find((c: any) => c.email.toLowerCase() === clientEmail.toLowerCase())?.name || clientEmail;
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Coach ${user?.name || user?.email} sent questionnaire "${selectedQnaireForSend.title}" to trainee "${traineeName}" and locked their dashboard.`,
        timestamp: new Date().toISOString(),
        type: 'warning'
      };
      const savedLogs = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogs ? JSON.parse(savedLogs) : [];
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));
    });

    toast.success(isEn 
      ? `Questionnaire sent to ${selectedClientEmails.length} trainees successfully!` 
      : `تم إرسال الاستبيان وقفل لوحة التحكم لـ ${selectedClientEmails.length} متدرب بنجاح!`
    );

    // Reset States
    setIsSendModalOpen(false);
    setSelectedQnaireForSend(null);
    setSelectedClientEmails([]);
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEn ? 'Mandatory Questionnaires' : 'الاستبيانات الإلزامية'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEn 
              ? 'Create onboarding or monthly surveys. Lock trainee dashboards until they submit their answers.' 
              : 'صمم أسئلة مخصصة أو تقييمات شهرية، وقم بقفل لوحات تحكم المشتركين حتى يقوموا بالإجابة عليها.'}
          </p>
        </div>
        
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>{isEn ? 'Create Questionnaire' : 'إنشاء استبيان جديد'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('manage'); setIsCreating(false); }}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'manage' && !isCreating
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardList size={16} />
            {isEn ? 'Manage Questionnaires' : 'إدارة الاستبيانات'}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('answers'); setIsCreating(false); }}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'answers'
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users size={16} />
            {isEn ? 'Submitted Answers' : 'الإجابات المستلمة'}
            {responses.length > 0 && (
              <span className="bg-primary/25 text-primary text-[10px] px-2 py-0.5 rounded-full font-black">
                {responses.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <h3 className="text-xl font-bold">
                  {isEn ? 'Create Custom Questionnaire' : 'إنشاء استبيان مخصص'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
              </div>

              <form onSubmit={handleSaveQuestionnaire} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? 'Questionnaire Title *' : 'عنوان الاستبيان *'}
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isEn ? 'e.g., Weekly Onboarding Survey' : 'مثال: استبيان التقييم والمتابعة الأسبوعي'}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* Question List Builder */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {isEn ? 'Questions List' : 'قائمة الأسئلة'}
                    </label>
                    <span className="text-xs font-bold text-primary">
                      {questions.length} {isEn ? 'Questions Added' : 'سؤالاً مضافاً'}
                    </span>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-background/50">
                      <HelpCircle size={36} className="mx-auto text-muted-foreground mb-3 opacity-60" />
                      <p className="text-sm font-bold">{isEn ? 'No questions added yet' : 'لم يتم إضافة أي أسئلة بعد'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isEn ? 'Choose a question type below to start building.' : 'اختر نوع السؤال من الأسفل للبدء بالبناء.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((q, qIndex) => (
                        <div key={q.id} className="p-5 rounded-2xl bg-background border border-border/80 relative space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                              {q.type === 'text' && <AlignLeft size={14} />}
                              {q.type === 'choice' && <List size={14} />}
                              {q.type === 'rating' && <Star size={14} />}
                              {isEn ? `Question #${qIndex + 1} (${q.type.toUpperCase()})` : `السؤال رقم ${qIndex + 1} (${q.type === 'text' ? 'نصي' : q.type === 'choice' ? 'اختيارات' : 'تقييم'})`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-muted-foreground hover:text-destructive transition-all"
                              title={isEn ? 'Remove Question' : 'إزالة السؤال'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              placeholder={isEn ? 'Enter your question text...' : 'اكتب نص السؤال هنا...'}
                              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              required
                            />

                            {/* Multiple Choice Options */}
                            {q.type === 'choice' && (
                              <div className="pl-6 border-l-2 border-primary/20 space-y-2 mt-2">
                                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                                  {isEn ? 'Multiple Choice Options' : 'خيارات الإجابة'}
                                </span>
                                {q.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                      placeholder={isEn ? `Option #${oIndex + 1}` : `الخيار رقم ${oIndex + 1}`}
                                      className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-border text-[11px] outline-none focus:border-primary/40"
                                      required
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(qIndex, oIndex)}
                                        className="text-muted-foreground hover:text-destructive text-xs"
                                      >
                                        &times;
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addOption(qIndex)}
                                  className="text-[10px] font-bold text-primary hover:underline mt-1 flex items-center gap-1"
                                >
                                  <Plus size={10} />
                                  <span>{isEn ? 'Add Option' : 'إضافة خيار'}</span>
                                </button>
                              </div>
                            )}

                            {/* Rating View Placeholder */}
                            {q.type === 'rating' && (
                              <div className="flex gap-1.5 pt-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                  <span key={n} className="w-6 h-6 rounded bg-card border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    {n}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question Add Triggers */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => addQuestion('text')}
                      className="py-3 rounded-xl border border-border/80 hover:border-primary/40 bg-background hover:bg-secondary/20 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all"
                    >
                      <AlignLeft size={16} className="text-primary" />
                      <span>{isEn ? 'Text Question' : 'سؤال نصي'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('choice')}
                      className="py-3 rounded-xl border border-border/80 hover:border-primary/40 bg-background hover:bg-secondary/20 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all"
                    >
                      <List size={16} className="text-emerald-500" />
                      <span>{isEn ? 'Multiple Choice' : 'اختيارات'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('rating')}
                      className="py-3 rounded-xl border border-border/80 hover:border-primary/40 bg-background hover:bg-secondary/20 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all"
                    >
                      <Star size={16} className="text-yellow-500" />
                      <span>{isEn ? 'Rating (1-10)' : 'تقييم (1-10)'}</span>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                >
                  {isEn ? 'Save and Publish Questionnaire' : 'حفظ ونشر الاستبيان الكلي'}
                </button>
              </form>
            </motion.div>
          ) : activeTab === 'manage' ? (
            <motion.div
              key="manage-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {questionnaires.length === 0 ? (
                <div className="col-span-full py-20 text-center rounded-3xl bg-card border border-dashed border-border">
                  <ClipboardList className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
                  <p className="text-lg font-bold">{isEn ? 'No questionnaires built yet' : 'لا توجد استبيانات حالياً'}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {isEn ? 'Click Create Questionnaire above to construct your first mandatory client lock-gate.' : 'اضغط على زر إنشاء استبيان جديد لبناء أول بوابة تقييم إلزامية.'}
                  </p>
                </div>
              ) : (
                questionnaires.map((q) => (
                  <div key={q.id} className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between hover:border-primary/20 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <FileText size={20} />
                        </div>
                        <button
                          onClick={() => handleDeleteQuestionnaire(q.id, q.title)}
                          className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          title={isEn ? 'Delete Questionnaire' : 'حذف الاستبيان'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm leading-tight text-white mb-2">{q.title}</h3>
                      
                      <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
                        <Calendar size={12} />
                        <span>{isEn ? 'Created:' : 'أنشئ في:'} {q.createdAt}</span>
                      </div>
                    </div>

                    <div className="border-t border-border/60 mt-6 pt-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {q.questions.length} {isEn ? 'Questions' : 'أسئلة'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {isEn ? 'Status: Ready' : 'الحالة: جاهز'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedQnaireForSend(q);
                          setSelectedClientEmails([]);
                          setIsSendModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send size={12} />
                        <span>{isEn ? 'Send to Trainees' : 'إرسال للمتدربين'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="answers-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {responses.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-card border border-dashed border-border">
                  <Users className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
                  <p className="text-lg font-bold">{isEn ? 'No answers submitted yet' : 'لا توجد إجابات مرسلة بعد'}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {isEn ? 'Once you send a questionnaire and a client answers it, the results will appear here.' : 'بمجرد إرسال استبيان وإجابة العميل عليه، ستظهر نتائج الإجابات هنا فوراً.'}
                  </p>
                </div>
              ) : (
                responses.map((res) => {
                  const isExpanded = expandedResponse === res.id;

                  return (
                    <div key={res.id} className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/10 transition-all">
                      {/* Summary Panel */}
                      <div 
                        onClick={() => setExpandedResponse(isExpanded ? null : res.id)}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold flex-shrink-0">
                            {res.clientName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm leading-tight text-white">{res.clientName}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono">({res.clientEmail})</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isEn ? 'Answered Questionnaire:' : 'أجاب على استبيان:'} <span className="text-primary font-bold">{res.questionnaireTitle}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-auto">
                          <div className="text-right text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{isEn ? 'Submitted:' : 'تم الإرسال:'} {res.submittedAt.split('T')[0]}</span>
                          </div>
                          
                          <button className="p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Detailed Answers */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-border/40 pt-4 mt-2 space-y-4"
                          >
                            {res.answers.map((ans, idx) => (
                              <div key={ans.questionId} className="p-4 rounded-2xl bg-background border border-border/40 space-y-2">
                                <p className="text-xs font-bold text-primary">
                                  Q{idx + 1}: {ans.questionText}
                                </p>
                                <div className="p-3 rounded-xl bg-card border border-border text-xs text-white whitespace-pre-wrap font-mono">
                                  {ans.answer || '—'}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Send Questionnaire to Multiple Trainees Modal */}
      {isSendModalOpen && selectedQnaireForSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            <h2 className="text-xl font-bold mb-2">
              {isEn ? 'Send Questionnaire' : 'إرسال الاستبيان للمتدربين'}
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              {isEn 
                ? `Select the trainees to send "${selectedQnaireForSend.title}" to. This locks their dashboard access.` 
                : `اختر المتدربين الذين ترغب في إرسال استبيان "${selectedQnaireForSend.title}" لهم. سيتم قفل لوحات تحكمهم.`}
            </p>

            {clients.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-2xl">
                <p className="text-sm font-bold">{isEn ? 'No trainees onboarded yet' : 'لا يوجد متدربون حالياً'}</p>
                <p className="text-xs text-muted-foreground mt-1">{isEn ? 'Please register a trainee in the Client Hub first.' : 'يرجى تسجيل مشترك جديد في صفحة إدارة المشتركين أولاً.'}</p>
                <button onClick={() => setIsSendModalOpen(false)} className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl w-full">
                  {isEn ? 'Close' : 'إغلاق'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendToClients} className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {clients.map((client) => {
                    const isChecked = selectedClientEmails.includes(client.email);

                    return (
                      <div 
                        key={client.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedClientEmails(selectedClientEmails.filter(e => e !== client.email));
                          } else {
                            setSelectedClientEmails([...selectedClientEmails, client.email]);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/60 hover:border-border bg-background/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {client.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{client.name}</p>
                            <span className="text-[10px] text-muted-foreground">{client.email}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'
                        }`}>
                          {isChecked && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-4 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => { setIsSendModalOpen(false); setSelectedQnaireForSend(null); setSelectedClientEmails([]); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    {isEn ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button
                    type="submit"
                    disabled={selectedClientEmails.length === 0}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40"
                  >
                    {isEn ? 'Send & Lock' : 'إرسال وقفل'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
