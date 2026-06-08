'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, RefreshCw, MessageCircle, LogOut, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/store/useLanguage';

// ─── Subscription Gate for Expired Coaches ───────────────────────────────────
function CoachSubscriptionExpiredGate({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Glowing icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.15)]">
            <ShieldAlert size={36} className="text-rose-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Subscription Expired</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your platform license has expired or is pending activation.
            Your account has been temporarily locked until the subscription is renewed.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-3 mt-6">
          <a
            href="/dashboard/coach/settings"
            className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Renew My Subscription</p>
              <p className="text-[11px] text-muted-foreground">Go to Settings → Licensing to extend your plan</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-brand-purple" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Contact System Administrator</p>
              <p className="text-[11px] text-muted-foreground">Reach out to the platform owner to activate your license</p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all mt-2"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Subscription Gate for Expired Clients ───────────────────────────────────
function ClientSubscriptionExpiredGate({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Glowing icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.15)]">
            <ShieldAlert size={36} className="text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Subscription Expired</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your training subscription has ended and your access has been temporarily paused.
            Please contact your coach to renew your plan and restore full access.
          </p>
        </div>

        {/* Action card */}
        <div className="p-4 rounded-2xl bg-card border border-border text-left flex items-center gap-3 mt-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Contact Your Coach</p>
            <p className="text-[11px] text-muted-foreground">Ask your coach to renew or extend your subscription package</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all mt-2"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Helper: check if a client is locked by a questionnaire ─────────────────
function getClientLockStatus(userEmail: string): { isLocked: boolean; activeQuestionnaireId: string | null } {
  try {
    const savedClients = localStorage.getItem('coachClients');
    if (!savedClients) return { isLocked: false, activeQuestionnaireId: null };
    const clients: any[] = JSON.parse(savedClients);
    const match = clients.find((c) => c.email.toLowerCase() === userEmail.toLowerCase());
    if (!match) return { isLocked: false, activeQuestionnaireId: null };
    return {
      isLocked: !!match.isLocked,
      activeQuestionnaireId: match.activeQuestionnaireId || null
    };
  } catch {
    return { isLocked: false, activeQuestionnaireId: null };
  }
}

interface Question {
  id: string;
  type: 'text' | 'choice' | 'rating';
  text: string;
  options: string[];
}

interface Questionnaire {
  id: string;
  coachEmail: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

function MandatoryQuestionnaireGate({ 
  user, 
  questionnaireId, 
  onUnlock, 
  onLogout 
}: { 
  user: any; 
  questionnaireId: string; 
  onUnlock: () => void; 
  onLogout: () => void; 
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const autoUnlock = () => {
    try {
      const savedClients = localStorage.getItem('coachClients');
      if (savedClients) {
        const clients = JSON.parse(savedClients);
        const updated = clients.map((c: any) => {
          if (c.email.toLowerCase() === user.email.toLowerCase()) {
            return { ...c, isLocked: false, activeQuestionnaireId: null };
          }
          return c;
        });
        localStorage.setItem('coachClients', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
    onUnlock();
  };

  useEffect(() => {
    try {
      const savedQs = localStorage.getItem('platformQuestionnaires');
      const allQs: Questionnaire[] = savedQs ? JSON.parse(savedQs) : [];
      const match = allQs.find(q => q.id === questionnaireId);
      
      if (!match) {
        toast.error(isEn 
          ? "The questionnaire requested by your coach was deleted. Access restored."
          : "الاستبيان المطلوب من قبل المدرب تم حذفه. تم فتح الحساب."
        );
        autoUnlock();
      } else {
        setQuestionnaire(match);
        const initialAnswers: Record<string, string> = {};
        match.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      }
    } catch {
      autoUnlock();
    } finally {
      setLoading(false);
    }
  }, [questionnaireId]);

  const handleRatingSelect = (qId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: String(value) }));
  };

  const handleTextChange = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleChoiceSelect = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionnaire) return;

    for (const q of questionnaire.questions) {
      if (!answers[q.id] || !answers[q.id].trim()) {
        toast.error(isEn 
          ? `Please answer all questions before submitting.` 
          : `يرجى الإجابة على جميع الأسئلة قبل الإرسال.`
        );
        return;
      }
    }

    try {
      const savedAnswers = localStorage.getItem('clientQuestionnaireAnswers');
      const allAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
      const newResponse = {
        id: 'resp-' + Math.random().toString(36).substr(2, 9),
        clientEmail: user.email,
        clientName: user.name || 'Client Trainee',
        questionnaireId: questionnaire.id,
        questionnaireTitle: questionnaire.title,
        answers: questionnaire.questions.map(q => ({
          questionId: q.id,
          questionText: q.text,
          answer: answers[q.id]
        })),
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem('clientQuestionnaireAnswers', JSON.stringify([...allAnswers, newResponse]));

      const savedClients = localStorage.getItem('coachClients');
      if (savedClients) {
        const clients = JSON.parse(savedClients);
        const updated = clients.map((c: any) => {
          if (c.email.toLowerCase() === user.email.toLowerCase()) {
            return { ...c, isLocked: false, activeQuestionnaireId: null };
          }
          return c;
        });
        localStorage.setItem('coachClients', JSON.stringify(updated));
      }

      const savedNotifs = localStorage.getItem('coachNotifications');
      const allNotifs = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        title: isEn ? 'Questionnaire Completed' : 'تمت الإجابة على الاستبيان',
        message: isEn 
          ? `Trainee ${user.name || user.email} completed "${questionnaire.title}"`
          : `قام المتدرب ${user.name || user.email} بالإجابة على استبيان "${questionnaire.title}"`,
        createdAt: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('coachNotifications', JSON.stringify([newNotif, ...allNotifs]));

      const savedLogs = localStorage.getItem('platformAuditLogs');
      const allLogs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Trainee ${user.name || user.email} submitted answers for questionnaire "${questionnaire.title}" and unlocked dashboard.`,
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...allLogs].slice(0, 50)));

      toast.success(isEn ? 'Answers submitted! Access restored.' : 'تم إرسال الإجابات! تم فتح لوحة التحكم بنجاح.');
      onUnlock();
    } catch (err) {
      toast.error(isEn ? 'Failed to submit questionnaire.' : 'فشل إرسال الإجابات.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!questionnaire) return null;

  return (
    <div className="min-h-screen bg-background/95 flex items-center justify-center p-4 py-12 md:py-20 overflow-y-auto">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 my-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.1)]">
              <ClipboardList size={30} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              {isEn ? 'Mandatory Questionnaire' : 'استبيان إلزامي مطلوب'}
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-md mx-auto">
              {isEn 
                ? 'Your coach requires you to answer this questionnaire. Access to the platform is locked until submitted.' 
                : 'يطلب منك الكابتن الإجابة على هذا الاستبيان. تم قفل لوحة التحكم مؤقتاً حتى تقوم بتقديم الإجابات.'}
            </p>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6">
          <h2 className="text-lg font-bold text-center text-primary mb-6">
            {questionnaire.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {questionnaire.questions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-background border border-border/80 space-y-3">
                <label className="block text-xs font-bold text-white leading-relaxed">
                  Q{idx + 1}: {q.text}
                </label>

                {q.type === 'text' && (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    required
                    placeholder={isEn ? 'Write your response here...' : 'اكتب إجابتك هنا...'}
                    className="w-full h-24 px-4 py-3 rounded-xl bg-card border border-border text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-white"
                  />
                )}

                {q.type === 'choice' && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChoiceSelect(q.id, opt)}
                        className={`w-full py-3 px-4 rounded-xl border text-left text-xs font-bold transition-all ${
                          answers[q.id] === opt
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-border bg-card text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'rating' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-1.5 justify-between">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleRatingSelect(q.id, n)}
                          className={`w-8 h-8 rounded-lg border text-xs font-black flex items-center justify-center transition-all ${
                            answers[q.id] === String(n)
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-md'
                              : 'border-border bg-card text-muted-foreground hover:border-border/80'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase px-1">
                      <span>{isEn ? 'Very Low (1)' : 'منخفض جداً (1)'}</span>
                      <span>{isEn ? 'Excellent (10)' : 'ممتاز جداً (10)'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg text-xs"
              >
                {isEn ? 'Submit Answers & Unlock Dashboard' : 'إرسال الإجابات وفتح لوحة التحكم'}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
              >
                <LogOut size={14} />
                <span>{isEn ? 'Log Out' : 'تسجيل الخروج'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: check if a coach is expired/pending ─────────────────────────────
function getCoachSubscriptionStatus(userEmail: string): 'Active' | 'Expired' | 'Pending' | 'Free' | 'Unknown' {
  try {
    const savedCoaches = localStorage.getItem('platformCoaches');
    if (!savedCoaches) return 'Unknown';
    const coaches: any[] = JSON.parse(savedCoaches);
    const match = coaches.find((c) => c.email.toLowerCase() === userEmail.toLowerCase());
    if (!match) return 'Unknown';

    // If explicitly marked pending
    if (match.status === 'Pending') return 'Pending';
    if (match.status === 'Free') return 'Active';

    // Check date-based expiry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(match.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    if (expiry < today) return 'Expired';

    return 'Active';
  } catch {
    return 'Unknown';
  }
}

// ─── Helper: check if a client's subscription is expired ─────────────────────
function getClientSubscriptionStatus(userEmail: string): 'Active' | 'Expired' | 'Unknown' {
  try {
    const savedClients = localStorage.getItem('coachClients');
    if (!savedClients) return 'Unknown';
    const clients: any[] = JSON.parse(savedClients);
    const match = clients.find((c) => c.email.toLowerCase() === userEmail.toLowerCase());
    if (!match) return 'Unknown';
    if (match.status === 'Expired') return 'Expired';
    return 'Active';
  } catch {
    return 'Unknown';
  }
}

// ─── Main Dashboard Layout ────────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<{ isLocked: boolean; activeQuestionnaireId: string | null }>({ isLocked: false, activeQuestionnaireId: null });

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  // Check subscription status after hydration (client-side only)
  useEffect(() => {
    if (!user) return;

    if (user.role === 'COACH') {
      const status = getCoachSubscriptionStatus(user.email);
      setSubscriptionStatus(status);
    } else if (user.role === 'CLIENT') {
      const status = getClientSubscriptionStatus(user.email);
      setSubscriptionStatus(status);

      const lock = getClientLockStatus(user.email);
      setLockStatus(lock);
    } else {
      // ADMIN — never gated
      setSubscriptionStatus('Active');
    }
  }, [user]);

  const refreshLockStatus = () => {
    if (user && user.role === 'CLIENT') {
      const lock = getClientLockStatus(user.email);
      setLockStatus(lock);
    }
  };

  if (!user) return null;

  // ── Coach subscription gate ──
  if (
    user.role === 'COACH' &&
    subscriptionStatus !== null &&
    (subscriptionStatus === 'Expired' || subscriptionStatus === 'Pending')
  ) {
    return <CoachSubscriptionExpiredGate user={user} onLogout={logout} />;
  }

  // ── Client subscription gate ──
  if (
    user.role === 'CLIENT' &&
    subscriptionStatus === 'Expired'
  ) {
    return <ClientSubscriptionExpiredGate user={user} onLogout={logout} />;
  }

  // ── Client questionnaire lockout gate ──
  if (
    user.role === 'CLIENT' &&
    lockStatus.isLocked &&
    lockStatus.activeQuestionnaireId
  ) {
    return (
      <MandatoryQuestionnaireGate
        user={user}
        questionnaireId={lockStatus.activeQuestionnaireId}
        onUnlock={refreshLockStatus}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col w-full">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
