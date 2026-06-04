import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface RegisterPageProps {
  onLoginClick: () => void;
  onRegisterSuccess: () => void;
  onBackClick: () => void;
  theme: 'light' | 'dark';
  showToast: (msg: string) => void;
}

export default function RegisterPage({
  onLoginClick,
  onRegisterSuccess,
  onBackClick,
  theme,
  showToast
}: RegisterPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your phone number.');
      return false;
    }
    if (!password) {
      setErrorMsg('Please choose a secure password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify inputs.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Create firebase auth credentials
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Setup display profile details
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // 3. Keep standard metadata record inside Firestore `/users/{userId}` path for lookup/persistence
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          fullName,
          email,
          phoneNumber,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not save profile metadata doc, but authenticator worked:", err);
      }

      showToast('Account created successfully.');
      onRegisterSuccess(); // Opens the LoginPage view
    } catch (error: any) {
      console.error("Registration error: ", error);
      let readableError = 'Failed to create your account. Please attempt again.';
      if (error.code === 'auth/email-already-in-use') {
        readableError = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        readableError = 'The password selected is too weak. Choose at least 6 characters.';
      } else if (error.message) {
        readableError = error.message;
      }
      setErrorMsg(readableError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-main-bg text-text-main transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-card-bg border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Back control */}
        <button
          onClick={onBackClick}
          className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan-400 font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center pt-4">
          <div className="flex justify-center items-center gap-2.5 mb-3">
            <img 
              src="https://image.shoutmecrunch.com/wp-content/uploads/2026/05/gg.webp" 
              alt="Gadget World logo" 
              className="w-12 h-12 object-contain rounded-xl p-1 bg-white/5 border border-border-subtle"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-white">
            Gadget<span className="text-cyan-400">World</span>
          </h2>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-mono">
            Smart products, better life
          </p>
          <h3 className="text-lg font-medium text-white/90 mt-4">
            Join Gadget World Today!
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Build your smart profile to track orders, claim extended warranty & checkout fast
          </p>
        </div>

        {/* Input Validation Error banner block */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-xs text-left leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          {/* Full Name input */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-11 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
              />
              <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-11 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
              />
              <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {/* Phone input */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                disabled={isLoading}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-11 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
              />
              <Phone className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {/* Password inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-4 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                Confirm
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-4 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
                />
              </div>
            </div>
          </div>

          {/* Register Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer shadow-xl shadow-cyan-950/20 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <span>REGISTER</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted space-y-1">
          <p>
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer hover:underline"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
