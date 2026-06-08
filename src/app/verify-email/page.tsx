'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      const verify = async () => {
        try {
          await api.get(`/auth/verify?token=${token}`);
          setStatus('success');
        } catch (error) {
          setStatus('error');
        }
      };
      verify();
    } else {
      setStatus('error');
    }
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-12 text-center shadow-2xl"
    >
      {status === 'loading' && (
        <>
          <Loader2 className="w-20 h-20 text-brand-purple animate-spin mx-auto mb-8" />
          <h1 className="text-3xl font-bold mb-4">Verifying Email...</h1>
          <p className="text-muted-foreground">Please wait while we secure your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
          <p className="text-muted-foreground mb-8">Your account is now secure and ready to use.</p>
          <Button onClick={() => router.push('/login')} className="w-full h-12 text-lg">
            Continue to Login
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
          <p className="text-muted-foreground mb-8">The link is invalid or has expired. Please try again.</p>
          <Button variant="outline" onClick={() => router.push('/login')} className="w-full h-12">
            Back to Login
          </Button>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-12 text-center shadow-2xl">
          <Loader2 className="w-20 h-20 text-brand-purple animate-spin mx-auto mb-8" />
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
