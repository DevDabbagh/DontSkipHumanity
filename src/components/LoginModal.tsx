"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth, type SocialProvider } from "@/contexts/AuthContext";
import SocialButtons from "@/components/SocialButtons";

type AuthView =
  | "login"
  | "register"
  | "verifyOtp"
  | "newPassword"
  | "forgotPassword";

/**
 * Which email the code came from, and therefore what happens after it is
 * accepted: a new account is simply signed in, a reset goes on to choose a
 * password.
 *
 * One screen for both because it is the same screen — same digits, same
 * inbox, same waiting. Two near-identical components would have drifted the
 * first time either got a fix.
 */
type OtpPurpose = "signup" | "recovery";

/** Seconds before "send another" is offered again. */
const RESEND_COOLDOWN = 60;

/**
 * How many digits the confirmation code has.
 *
 * Must match **Authentication → Providers → Email → Email OTP Length** in
 * Supabase, and the `length:` on the mobile app's OTP screen. All three are
 * the same number in three places, and nothing checks that they agree: set
 * Supabase to 8 while this says 6 and the field fills up before the code is
 * finished, with no error to explain it.
 */
const OTP_LENGTH = 6;

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
  const [otp, setOtp] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("signup");
  const [cooldown, setCooldown] = useState(0);

  const {
    signInWithEmail,
    signUpWithEmail,
    verifySignupOtp,
    resendSignupOtp,
    signInWithProvider,
    resetPassword,
    verifyRecoveryOtp,
    setNewPassword,
  } = useAuth();

  /**
   * Counts the resend cooldown down once a second.
   *
   * Supabase enforces its own 60-second window per user and answers a early
   * retry with a rate-limit error. Showing the wait instead of letting people
   * press a button that can only fail is the difference between "it's
   * coming" and "this is broken" — and a visible timer is what stops the
   * second, third and fourth press that burn the project's hourly email quota
   * for everyone.
   */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setOtp("");
    setCooldown(0);
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
        // Straight to the code field rather than "check your email" and a
        // dead end. The address is kept so the next step can verify against
        // it without asking for it twice.
        goToOtp("signup");
      }
    } else if (view === "verifyOtp") {
      const verify = otpPurpose === "signup" ? verifySignupOtp : verifyRecoveryOtp;
      const { error: err } = await verify(email, otp);
      if (err) {
        setError(err);
      } else if (otpPurpose === "signup") {
        // Supabase returns a session, the auth listener picks it up, and the
        // reader is signed in. Nothing more to confirm.
        handleClose();
      } else {
        // A reset is only half done here — the session proves the mailbox,
        // but the forgotten password is still the account's password.
        setPassword("");
        setError(null);
        setSuccess("Code accepted. Choose a new password.");
        setView("newPassword");
      }
    } else if (view === "newPassword") {
      const { error: err } = await setNewPassword(password);
      if (err) {
        setError(err);
      } else {
        handleClose();
      }
    } else if (view === "forgotPassword") {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        goToOtp("recovery");
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

  /**
   * Hands off to the code screen after an email has just been sent.
   *
   * Starts the cooldown here rather than on the resend button, because the
   * first email has already gone out — offering "send another" the instant
   * the screen appears invites a press that Supabase will refuse, and makes
   * a working flow look broken.
   */
  const goToOtp = (purpose: OtpPurpose) => {
    setOtpPurpose(purpose);
    setOtp("");
    setCooldown(RESEND_COOLDOWN);
    setError(null);
    setSuccess(`We sent a ${OTP_LENGTH}-digit code to ${email}.`);
    setView("verifyOtp");
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);

    const { error: err } =
      otpPurpose === "signup"
        ? await resendSignupOtp(email)
        : await resetPassword(email);

    if (err) {
      setError(err);
    } else {
      setSuccess("A new code is on its way.");
      setCooldown(RESEND_COOLDOWN);
    }
    setIsLoading(false);
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

            {/* View: Verify the code from the confirmation email */}
            {view === "verifyOtp" && (
              <motion.div key="verify-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="duration-300">
                <h2 className="text-2xl font-bold mb-2">
                  {otpPurpose === "signup" ? "Check your email" : "Reset your password"}
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Enter the {OTP_LENGTH}-digit code we sent to{" "}
                  <span className="text-white">{email}</span>. It expires in 60 minutes.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    // `inputMode` + `autoComplete` together are what make a
                    // phone show the number pad AND offer the code from the
                    // notification, so most readers never open their inbox.
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    // `pattern` alone would not stop a paste; the onChange
                    // strips non-digits so a code copied with a stray space
                    // or an invisible character still verifies.
                    placeholder={"0".repeat(OTP_LENGTH)}
                    required
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                    autoFocus
                    className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`}
                  />
                  <button type="submit" disabled={isLoading || otp.length < OTP_LENGTH} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Confirm"}
                  </button>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-sm text-center">
                  <button
                    type="button"
                    disabled={isLoading || cooldown > 0}
                    onClick={handleResend}
                    className="text-gray-400 hover:text-white transition-colors font-medium disabled:opacity-40 disabled:hover:text-gray-400 disabled:cursor-default"
                  >
                    {cooldown > 0
                      ? `Didn't get it? Send another in ${cooldown}s`
                      : "Didn't get it? Send another"}
                  </button>
                  <button onClick={() => switchView("login")} className="text-gray-500 hover:text-white transition-colors" type="button">
                    &larr; Back to log in
                  </button>
                </div>
              </motion.div>
            )}

            {/* View: Choose a new password, after a verified reset code */}
            {view === "newPassword" && (
              <motion.div key="new-password-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="duration-300">
                <h2 className="text-2xl font-bold mb-2">Choose a new password</h2>
                <p className="text-gray-400 text-sm mb-6">
                  You&apos;re signed in as <span className="text-white">{email}</span>. Pick
                  something you haven&apos;t used here before.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    required
                    minLength={6}
                    // The reset code was just accepted, so nothing is waiting
                    // on the reader except this field.
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button type="submit" disabled={isLoading || password.length < 6} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Save password"}
                  </button>
                </form>

                {/* No "skip" and no way back to the code screen. The session
                    is already live, so leaving here signs them in with the
                    old password still set — which is a working account, just
                    not the one they asked for. Closing the modal does that
                    and says nothing, which is the honest outcome. */}
              </motion.div>
            )}

            {/* View: Forgot Password */}
            {view === "forgotPassword" && (
              <motion.div key="forgot-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="duration-300">
                <h2 className="text-2xl font-bold mb-2">Password recovery</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your email and we&apos;ll send a {OTP_LENGTH}-digit code.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <button type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Send code"}
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
