'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Check, 
  Tag,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'stripe', name: 'Credit / Debit Card', icon: CreditCard, description: 'Powered by Stripe' },
  { id: 'paymob', name: 'Paymob / Kiosk', icon: Smartphone, description: 'Pay via Fawry or Cards' },
  { id: 'wallet', name: 'Mobile Wallet', icon: Wallet, description: 'Vodafone Cash, Orange, etc.' },
  { id: 'instapay', name: 'InstaPay', icon: Check, description: 'Direct bank transfer' },
];

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);

  const basePrice = 79;
  const finalPrice = discountApplied ? basePrice * 0.8 : basePrice;

  const handleCouponApply = () => {
    if (coupon === 'SAVE20') {
      setDiscountApplied(true);
      toast.success('20% Discount Applied!');
    } else {
      toast.error('Invalid Coupon Code');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/checkout', {
        planName: 'Professional Plan',
        amount: basePrice,
        method: selectedMethod,
        couponCode: discountApplied ? 'SAVE20' : undefined
      });

      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      } else {
        toast.success(response.data.data.message);
      }
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Payment Methods */}
        <div className="lg:col-span-8 space-y-8">
           <div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Complete your purchase</h1>
              <p className="text-muted-foreground">Select your preferred payment method to activate your plan.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                 <button
                   key={method.id}
                   onClick={() => setSelectedMethod(method.id)}
                   className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                     selectedMethod === method.id 
                      ? 'bg-primary/5 border-primary shadow-lg' 
                      : 'bg-card border-border hover:border-primary/20'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className={`p-3 rounded-2xl ${selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                          <method.icon size={24} />
                       </div>
                       {selectedMethod === method.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                             <Check size={14} />
                          </div>
                       )}
                    </div>
                    <h3 className="font-bold text-lg">{method.name}</h3>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                 </button>
              ))}
           </div>

           <div className="p-8 rounded-[2rem] bg-secondary/20 border border-border">
              <div className="flex items-center space-x-3 mb-4 text-muted-foreground">
                 <Lock size={16} />
                 <span className="text-xs font-bold uppercase tracking-widest">Secure Checkout</span>
              </div>
              <p className="text-sm text-muted-foreground">
                 Your payment information is processed securely. We do not store your credit card details on our servers.
              </p>
           </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
           <Card className="p-8 border-none shadow-2xl bg-card">
              <h2 className="text-xl font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Professional Plan</span>
                    <span className="font-bold">${basePrice}.00</span>
                 </div>
                 {discountApplied && (
                    <div className="flex justify-between text-sm text-green-500">
                       <span>Discount (20%)</span>
                       <span>-${(basePrice * 0.2).toFixed(2)}</span>
                    </div>
                 )}
                 <div className="pt-4 border-t border-border flex justify-between">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-2xl font-black">${finalPrice.toFixed(2)}</span>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Promo Code</label>
                 <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter code" 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <Button variant="outline" onClick={handleCouponApply}>Apply</Button>
                 </div>
              </div>

              <Button 
                variant="brand" 
                className="w-full h-14 text-lg rounded-2xl" 
                onClick={handleCheckout}
                disabled={loading}
              >
                 {loading ? <Loader2 className="animate-spin" /> : (
                   <>
                     Pay Now
                     <ArrowRight size={18} className="ml-2" />
                   </>
                 )}
              </Button>
           </Card>

           <div className="text-center space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Guaranteed safe checkout</p>
              <div className="flex justify-center space-x-4 grayscale opacity-50">
                 {/* Visual icons for cards could go here */}
                 <div className="w-8 h-5 bg-muted-foreground rounded-sm" />
                 <div className="w-8 h-5 bg-muted-foreground rounded-sm" />
                 <div className="w-8 h-5 bg-muted-foreground rounded-sm" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
