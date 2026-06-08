'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl"
      >
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {!sent ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Forgot Password?</h1>
            <p className="text-muted-foreground mb-8">
              No worries, it happens. Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-bold mb-2 block uppercase tracking-wider">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Mail size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Check your email</h2>
            <p className="text-muted-foreground mb-8">
              We've sent a password reset link to <span className="text-foreground font-bold">{email}</span>.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="w-full">
              Try another email
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
