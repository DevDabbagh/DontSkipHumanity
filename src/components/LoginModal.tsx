"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth, type SocialProvider } from "@/contexts/AuthContext";
import SocialButtons from "@/components/SocialButtons";

type AuthView = "login" | "register" | "forgotPassword";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const { signInWithEmail, signUpWithEmail, signInWithProvider, resetPassword } = useAuth();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    clearForm();
    setView("login");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (view === "login") {
      const { error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(err);
      } else {
        handleClose();
      }
    } else if (view === "register") {
      const { error: err } = await signUpWithEmail(email, password, fullName);
      if (err) {
        setError(err);
      } else {
        setSuccess("Check your email to confirm your account.");
      }
    } else if (view === "forgotPassword") {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setSuccess("Reset link sent! Check your inbox.");
      }
    }

    setIsLoading(false);
  };

  const handleProviderLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError(null);
    const { error: err } = await signInWithProvider(provider);
    if (err) {
      setError(err);
      setIsLoading(false);
    }
    // On success the page navigates away to the provider, so there is no
    // point clearing the spinner — the component is about to be unmounted.
  };

  const switchView = (v: AuthView) => {
    setError(null);
    setSuccess(null);
    setView(v);
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark";
  const btnPrimary = "w-full flex items-center justify-center bg-white text-black font-semibold tracking-wide rounded-xl py-3 mt-2 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-[0_0_60px_-15px_rgba(155,89,182,0.15)] relative overflow-hidden"
          >
            {/* Decorative Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#9B59B6]/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[20px] bg-[#9B59B6]/20 blur-[20px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Error / Success messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* View: Login */}
            {view === "login" && (
              <motion.div key="login-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="duration-300">
                <div className="flex flex-col items-center mb-8">
                  <Image src="/images/ic_logo.png" alt="Don't Skip Humanity" width={160} height={46} className="h-9 w-auto mb-6" />
                  <h2 className="text-2xl font-bold tracking-tight text-white/90">Welcome back</h2>
                  <p className="text-sm text-gray-500 mt-2">Log in to continue your journey</p>
                </div>

                <SocialButtons onPick={handleProviderLogin} disabled={isLoading} />

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  <button type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Log in"}
                  </button>
                </form>

                <div className="mt-8 flex flex-col gap-4 text-sm text-center">
                  <button onClick={() => switchView("forgotPassword")} className="text-gray-400 hover:text-white transition-colors font-medium" type="button">
                    Forgot your password?
                  </button>
                  <div className="text-gray-500">
                    Don&apos;t have an account?{" "}
                    <button onClick={() => switchView("register")} className="text-white hover:text-[#9B59B6] transition-colors font-medium ml-1" type="button">
                      Sign up
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View: Register */}
            {view === "register" && (
              <motion.div key="register-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="duration-300">
                <h2 className="text-2xl font-bold mb-2">Create an account</h2>
                <p className="text-gray-400 text-sm mb-6">Save your progress, your reading, and your place across the platform.</p>

                <SocialButtons onPick={handleProviderLogin} disabled={isLoading} />

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <input type="password" placeholder="Password (min 6 characters)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  <button type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Create account"}
                  </button>
                </form>

                <div className="mt-6 text-sm text-center">
                  <button onClick={() => switchView("login")} className="text-gray-400 hover:text-white transition-colors" type="button">
                    Already have an account? Log in
                  </button>
                </div>
              </motion.div>
            )}

            {/* View: Forgot Password */}
            {view === "forgotPassword" && (
              <motion.div key="forgot-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="duration-300">
                <h2 className="text-2xl font-bold mb-2">Password recovery</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <button type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-6 text-sm text-center">
                  <button onClick={() => switchView("login")} className="text-gray-400 hover:text-white transition-colors" type="button">
                    &larr; Back to log in
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
