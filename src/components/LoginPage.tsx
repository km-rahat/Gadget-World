import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginPageProps {
  onRegisterClick: () => void;
  onLoginSuccess: (user: any) => void;
  onBackClick: () => void;
  theme: 'light' | 'dark';
  showToast: (msg: string) => void;
}

export default function LoginPage({
  onRegisterClick,
  onLoginSuccess,
  onBackClick,
  theme,
  showToast
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showToast(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`);
      onLoginSuccess(userCredential.user);
    } catch (error: any) {
      console.error("Login failure: ", error);
      let readableError = 'Failed to login. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        readableError = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        readableError = 'Too many requests. Please try again later or reset password.';
      } else if (error.message) {
        readableError = error.message;
      }
      setErrorMsg(readableError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address in the field above to reset password.');
      showToast('Please type your email address first!');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to your email.');
      setErrorMsg('');
    } catch (error: any) {
      console.error("Forgot password failure: ", error);
      setErrorMsg(error.message || 'Could not send reset link. Verify your email is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-main-bg text-text-main transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-card-bg border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Back to Catalog Control */}
        <button
          onClick={onBackClick}
          className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan-400 font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Branding Title Desk */}
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
            Welcome Back!
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Access your secure smart cart and premium orders dispatch desk
          </p>
        </div>

        {/* Input Validation Error banner block */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-xs text-left leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
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
                placeholder="you@example.com"
                className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-11 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
              />
              <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-905 border border-border-subtle text-xs rounded-xl p-3.5 pl-11 pr-11 text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition"
              />
              <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-text-main transition p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me control options */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-border-subtle text-cyan-500 focus:ring-cyan-500/25 h-4 w-4 bg-slate-909"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Login submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer shadow-xl shadow-cyan-950/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>LOGGING IN...</span>
              </>
            ) : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted space-y-1">
          <p>
            Don&apos;t have an account?{' '}
            <button
              onClick={onRegisterClick}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer hover:underline"
            >
              Register
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
