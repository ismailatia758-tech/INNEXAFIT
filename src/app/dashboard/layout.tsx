'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, RefreshCw, MessageCircle, LogOut, ClipboardList, Crown, Check, CreditCard, Sparkles, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/store/useLanguage';
import api from '@/lib/api';

// ─── Subscription Gate for Expired Coaches ───────────────────────────────────
function CoachSubscriptionExpiredGate({ user, onLogout, status }: { user: any; onLogout: () => void; status?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'wallet'>('instapay');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [prices, setPrices] = useState({ monthly: 49, yearly: 399 });

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setDbUser(res.data);
      if (res.data.paymentScreenshot) {
        setStep(5); // Show waiting screen if screenshot is already uploaded
      }
    } catch (err) {
      console.error('Failed to load user status from backend:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchMe();
    
    const savedConfig = localStorage.getItem('platformConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setPrices({
        monthly: config.monthlyPrice ?? 49,
        yearly: config.yearlyPrice ?? 399
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndSubmit = async () => {
    if (!screenshotFile) {
      toast.error(isEn ? 'Please upload a screenshot of your payment' : 'يرجى رفع صورة لإثبات الدفع');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', screenshotFile);

    try {
      // 1. Upload screenshot
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = uploadRes.data.fileUrl;

      // 2. Update status and save screenshot in database
      const price = selectedPlan === 'Monthly' ? prices.monthly : prices.yearly;
      await api.put(`/admin/coaches/${user.id}`, {
        status: 'Pending',
        planType: selectedPlan,
        pricePaid: price,
        paymentScreenshot: fileUrl
      });

      // 3. Update localStorage platformCoaches list
      const savedCoachesStr = localStorage.getItem('platformCoaches');
      const coaches = savedCoachesStr ? JSON.parse(savedCoachesStr) : [];
      const coachIndex = coaches.findIndex((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
      
      const updatedCoach = {
        id: coachIndex >= 0 ? coaches[coachIndex].id : 'c-' + Math.random().toString(36).substr(2, 9),
        name: user.name || 'Coach',
        email: user.email,
        username: user.username || user.email.split('@')[0] + '@innexafit.com',
        planType: selectedPlan,
        pricePaid: price,
        status: 'Pending',
        paymentScreenshot: fileUrl,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date().toISOString().split('T')[0] // Will be correctly set on admin approval
      };

      if (coachIndex >= 0) {
        coaches[coachIndex] = updatedCoach;
      } else {
        coaches.push(updatedCoach);
      }
      localStorage.setItem('platformCoaches', JSON.stringify(coaches));

      // 4. Log Audit
      const savedLogsStr = localStorage.getItem('platformAuditLogs');
      const auditLogs = savedLogsStr ? JSON.parse(savedLogsStr) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action: `Coach ${user.name} submitted payment screenshot for ${selectedPlan} license approval.`,
        timestamp: new Date().toISOString(),
        type: 'info'
      };
      localStorage.setItem('platformAuditLogs', JSON.stringify([newLog, ...auditLogs].slice(0, 50)));

      toast.success(isEn ? 'Payment screenshot uploaded successfully!' : 'تم رفع صورة التحويل بنجاح!');
      setStep(5);
    } catch (err) {
      toast.error(isEn ? 'Failed to submit payment. Please try again.' : 'فشل إرسال إثبات الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      setDbUser(res.data);
      if (res.data.status === 'Active') {
        toast.success(isEn ? 'Your account has been activated! Welcome.' : 'تم تفعيل حسابك بنجاح! أهلاً بك.');
        window.location.reload(); // Refresh the page to unlock dashboard!
      } else {
        toast.error(isEn ? 'Your account is still pending verification.' : 'حسابك لا يزال قيد المراجعة والتحقق.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {step === 1 && (
          <div className="space-y-6 text-center">
            {/* Glowing icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.15)] animate-pulse">
                <ShieldAlert size={36} className="text-rose-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">
                {status === 'Pending' ? (isEn ? 'Activate Subscription' : 'تفعيل الاشتراك') : (isEn ? 'Subscription Expired' : 'انتهت صلاحية الاشتراك')}
              </h1>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mx-auto">
                {isEn 
                  ? 'Your platform license has expired or is pending activation. Your account has been temporarily locked until the subscription is renewed.'
                  : 'انتهت صلاحية رخصة المنصة الخاصة بك أو في انتظار التفعيل. تم قفل حسابك مؤقتاً حتى يتم تجديد الاشتراك.'}
              </p>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group text-left cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {status === 'Pending' ? (isEn ? 'Activate My Subscription' : 'تفعيل اشتراكي') : (isEn ? 'Renew My Subscription' : 'تجديد اشتراكي')}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-left">
                    {isEn ? 'Select a plan and process your payment' : 'اختر الخطة المناسبة وقم بعملية الدفع'}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isEn ? 'Contact System Administrator' : 'تواصل مع إدارة النظام'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isEn ? 'Reach out to the platform owner to activate' : 'تواصل مع مالك المنصة لتفعيل حسابك'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all mt-4"
            >
              <LogOut size={14} />
              <span>{isEn ? 'Log Out' : 'تسجيل الخروج'}</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-white transition-all bg-transparent border-0 cursor-pointer">
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-white">
                {isEn ? 'Step 1: Choose Plan' : 'الخطوة ١: اختيار باقة'}
              </h2>
              <div className="w-4" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-black text-white">
                {isEn ? 'Select License Package' : 'اختر رخصة الاشتراك'}
              </h1>
              <p className="text-muted-foreground text-[11px]">
                {isEn ? 'Select the billing period you want to subscribe to:' : 'حدد الباقة الزمنية التي ترغب بالاشتراك بها:'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <button
                type="button"
                onClick={() => setSelectedPlan('Monthly')}
                className={`p-5 rounded-2xl border text-center relative transition-all duration-300 flex flex-col items-center justify-between cursor-pointer ${
                  selectedPlan === 'Monthly'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card/40 hover:border-border/80'
                }`}
              >
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  {isEn ? 'Monthly' : 'شهري'}
                </span>
                <div className="my-1">
                  <span className="text-xl font-black text-white">EGP {prices.monthly}</span>
                  <span className="text-[10px] text-muted-foreground block">/{isEn ? 'month' : 'شهر'}</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-3 ${
                  selectedPlan === 'Monthly' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'Monthly' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('Yearly')}
                className={`p-5 rounded-2xl border text-center relative transition-all duration-300 flex flex-col items-center justify-between cursor-pointer ${
                  selectedPlan === 'Yearly'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card/40 hover:border-border/80'
                }`}
              >
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[7px] font-black text-neutral-900 uppercase tracking-widest shadow">
                  {isEn ? 'Save Big' : 'توفير أكبر'}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  {isEn ? 'Yearly' : 'سنوي'}
                </span>
                <div className="my-1">
                  <span className="text-xl font-black text-white">EGP {prices.yearly}</span>
                  <span className="text-[10px] text-muted-foreground block">/{isEn ? 'year' : 'سنة'}</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-3 ${
                  selectedPlan === 'Yearly' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'Yearly' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md mt-4 cursor-pointer"
            >
              {isEn ? 'Continue to Payment' : 'المتابعة لبيانات الدفع'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-white transition-all bg-transparent border-0 cursor-pointer">
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-white">
                {isEn ? 'Step 2: Payment Method' : 'الخطوة ٢: طريقة الدفع'}
              </h2>
              <div className="w-4" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-black text-white">
                {isEn ? 'Select Payment Method' : 'اختر وسيلة الدفع'}
              </h1>
              <p className="text-muted-foreground text-[11px]">
                {isEn ? 'Choose how you would like to transfer:' : 'اختر الطريقة التي تفضل التحويل من خلالها:'}
              </p>
            </div>

            <div className="flex p-1 rounded-xl bg-background border border-border">
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'instapay'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground'
                }`}
              >
                InstaPay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground'
                }`}
              >
                {isEn ? 'Mobile Wallet' : 'محفظة إلكترونية'}
              </button>
            </div>

            {/* Payment instruction box */}
            <div className="p-5 rounded-2xl bg-background/60 border border-border/80 text-center space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                  {isEn ? 'Transfer Amount' : 'المبلغ المطلوب تحويله'}
                </span>
                <span className="text-2xl font-black text-primary">
                  EGP {selectedPlan === 'Monthly' ? prices.monthly : prices.yearly}
                </span>
              </div>

              <div className="border-t border-border/40 pt-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider mb-1">
                  {isEn ? 'Transfer Account / Number' : 'رقم التحويل للمحفظة وانستاباي'}
                </span>
                <span className="text-xl font-black text-white tracking-widest block bg-card border border-border py-2 rounded-xl">
                  01110077531
                </span>
                <span className="text-[9px] text-yellow-500 block mt-1">
                  {isEn 
                    ? '* Both Instapay and Wallets transfer to this exact number.' 
                    : '* التحويل لانستاباي والمحافظ الإلكترونية يتم على هذا الرقم مباشرة.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md mt-4 cursor-pointer"
            >
              {isEn ? 'I Transferred, Next Step' : 'قمت بالتحويل، الخطوة التالية'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-white transition-all bg-transparent border-0 cursor-pointer">
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-white">
                {isEn ? 'Step 3: Upload Proof' : 'الخطوة ٣: إثبات الدفع'}
              </h2>
              <div className="w-4" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-black text-white">
                {isEn ? 'Upload Receipt Screenshot' : 'رفع إيصال التحويل'}
              </h1>
              <p className="text-muted-foreground text-[11px]">
                {isEn 
                  ? 'Please select and upload a screenshot of your transfer receipt:'
                  : 'يرجى تحديد ورفع لقطة الشاشة (سكرين شوت) لتفاصيل التحويل:'}
              </p>
            </div>

            <div className="space-y-4">
              {screenshotPreview ? (
                <div className="relative rounded-2xl border border-border overflow-hidden h-48 bg-background flex items-center justify-center group">
                  <img src={screenshotPreview} alt="Transfer Proof" className="max-h-full max-w-full object-contain" />
                  <button
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 border border-border hover:bg-red-500/20 hover:text-red-500 transition-all text-xs font-bold text-white cursor-pointer"
                  >
                    {isEn ? 'Remove' : 'حذف'}
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-2xl h-44 cursor-pointer bg-background/20 group">
                  <Upload size={32} className="text-muted-foreground group-hover:text-primary transition-all mb-2" />
                  <span className="text-xs font-bold text-white">
                    {isEn ? 'Choose Image' : 'اختر صورة الإيصال'}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    JPEG, PNG, SVG up to 5MB
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={handleUploadAndSubmit}
              disabled={isSubmitting || !screenshotFile}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard size={15} />
              <span>
                {isSubmitting 
                  ? (isEn ? 'Submitting Details...' : 'جاري إرسال البيانات...') 
                  : (isEn ? 'Submit & Confirm Payment' : 'إرسال وتأكيد عملية الدفع')}
              </span>
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center">
            {/* Glowing clock/loading icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-pulse">
                <RefreshCw size={36} className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-2xl font-black text-white">
                {isEn ? 'Payment Under Verification' : 'قيد التحقق والمراجعة'}
              </h1>
              <p className="text-yellow-500 text-xs font-black bg-yellow-500/10 border border-yellow-500/20 py-2.5 px-4 rounded-xl max-w-sm mx-auto">
                {isEn 
                  ? 'Your account will be activated in moments'
                  : 'في خلال لحظات هيتم تفعيل حسابك'}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed max-w-xs mx-auto">
                {isEn 
                  ? 'We are verifying your transfer details. As soon as the administrator approves, your dashboard will unlock.'
                  : 'جاري التحقق من تفاصيل إيصال التحويل الذي قمت برفعه. بمجرد تأكيد الإدارة، سيتم فتح لوحة التحكم تلقائياً.'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={checkStatus}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>{isEn ? 'Refresh Status' : 'تحديث حالة التفعيل'}</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all mt-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>{isEn ? 'Log Out' : 'تسجيل الخروج'}</span>
              </button>
            </div>
          </div>
        )}
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

    const checkSubscription = async () => {
      // 1. Local storage check for immediate load
      if (user.role === 'COACH') {
        const status = getCoachSubscriptionStatus(user.email);
        setSubscriptionStatus(status);
      } else if (user.role === 'CLIENT') {
        const status = getClientSubscriptionStatus(user.email);
        setSubscriptionStatus(status);

        const lock = getClientLockStatus(user.email);
        setLockStatus(lock);
      } else {
        setSubscriptionStatus('Active');
      }

      // 2. Fetch real-time status from backend if available
      try {
        const res = await api.get('/auth/me');
        const dbUser = res.data;
        if (user.role === 'COACH') {
          if (dbUser.status === 'Active') {
            setSubscriptionStatus('Active');
            
            // Sync with local storage platformCoaches so other pages are in sync!
            const savedCoachesStr = localStorage.getItem('platformCoaches');
            const coaches = savedCoachesStr ? JSON.parse(savedCoachesStr) : [];
            const idx = coaches.findIndex((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
            if (idx >= 0) {
              coaches[idx].status = 'Active';
              coaches[idx].planType = dbUser.planType;
              coaches[idx].expiryDate = dbUser.expiryDate;
              coaches[idx].startDate = dbUser.startDate;
              localStorage.setItem('platformCoaches', JSON.stringify(coaches));
            }
          } else {
            setSubscriptionStatus(dbUser.status || 'Pending');
          }
        }
      } catch (err) {
        console.warn('Could not sync user with backend:', err);
      }
    };

    checkSubscription();
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
    return <CoachSubscriptionExpiredGate user={user} onLogout={logout} status={subscriptionStatus} />;
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
