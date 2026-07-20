"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AuthView = "login" | "register" | "forgotPassword";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Mock handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Fake network delay for mockup
    setTimeout(() => {
      setIsLoading(false);
      if (view === "login" || view === "register") {
        onLoginSuccess();
      } else if (view === "forgotPassword") {
        alert("Reset link sent! Check your inbox.");
        setView("login");
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-[0_0_60px_-15px_rgba(155,89,182,0.15)] relative overflow-hidden"
            >
              {/* Decorative Top Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#9B59B6]/50 to-transparent"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[20px] bg-[#9B59B6]/20 blur-[20px] rounded-full pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* View: Login */}
              {view === "login" && (
                <motion.div 
                  key="login-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="duration-300"
                >
                  <div className="flex flex-col items-center mb-8">
                    <Image src="/images/ic_logo.png" alt="Don't Skip Humanity" width={160} height={46} className="h-9 w-auto mb-6" />
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">Welcome back</h2>
                    <p className="text-sm text-gray-500 mt-2">Log in to continue your journey</p>
                  </div>
                  
                  {/* Google OAuth Button */}
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full mb-6 flex items-center justify-center gap-3 border border-white/15 bg-white/[0.03] rounded-xl py-3 text-sm font-medium hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-white text-black font-semibold tracking-wide rounded-xl py-3 mt-2 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        "Log in"
                      )}
                    </button>
                  </form>
                  <div className="mt-8 flex flex-col gap-4 text-sm text-center">
                    <button onClick={() => setView("forgotPassword")} className="text-gray-400 hover:text-white transition-colors font-medium" type="button">
                      Forgot your password?
                    </button>
                    <div className="text-gray-500">
                      Don't have an account?{" "}
                      <button onClick={() => setView("register")} className="text-white hover:text-[#9B59B6] transition-colors font-medium ml-1" type="button">
                        Sign up
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* View: Register */}
              {view === "register" && (
                <motion.div 
                  key="register-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="duration-300"
                >
                  <h2 className="text-2xl font-bold mb-2">Create an account</h2>
                  <p className="text-gray-400 text-sm mb-6">Save your progress, your reading, and your place across the platform.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <input type="checkbox" required className="mt-0.5" />
                      <p>I agree to the Terms and Privacy Policy.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-white text-black font-semibold tracking-wide rounded-xl py-3 mt-2 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      ) : (
                        "Create account"
                      )}
                    </button>
                  </form>
                  <div className="mt-6 text-sm text-center">
                    <button onClick={() => setView("login")} className="text-gray-400 hover:text-white transition-colors" type="button">
                      Already have an account? Log in
                    </button>
                  </div>
                </motion.div>
              )}

              {/* View: Forgot Password */}
              {view === "forgotPassword" && (
                <motion.div 
                  key="forgot-password-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="duration-300"
                >
                  <h2 className="text-2xl font-bold mb-2">Password recovery</h2>
                  <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 focus:bg-white/[0.05] transition-all autofill-dark"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-white text-black font-semibold tracking-wide rounded-xl py-3 mt-2 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </form>
                  <div className="mt-6 text-sm text-center">
                    <button onClick={() => setView("login")} className="text-gray-400 hover:text-white transition-colors" type="button">
                      ← Back to log in
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
