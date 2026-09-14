"use client";

import type { SocialProvider } from "@/contexts/AuthContext";

/**
 * "Continue with Google" and "Continue with Apple".
 *
 * WHY THIS IS A COMPONENT
 *
 * The Google button was written out twice inside LoginModal — once in the
 * log-in view and once in the sign-up view — as forty identical lines
 * including the inline SVG. Adding Apple would have made that four copies,
 * and four copies of a button is four places for it to drift.
 *
 * The mobile app renders the same pair, in this order, with this wording, so
 * that someone who signs in on their phone and then on the website is looking
 * at the same choice both times.
 */
export default function SocialButtons({
  onPick,
  disabled = false,
}: {
  onPick: (provider: SocialProvider) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-6 space-y-3">
      <ProviderButton
        label="Continue with Google"
        disabled={disabled}
        onClick={() => onPick("google")}
        icon={
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        }
      />
      <ProviderButton
        label="Continue with Apple"
        disabled={disabled}
        onClick={() => onPick("apple")}
        icon={
          // Apple's mark is supplied as a single filled path and must stay
          // monochrome — their branding rules do not allow it recoloured or
          // outlined. White on our dark panel is one of the permitted forms.
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 12.54c-.03-2.75 2.25-4.07 2.35-4.13-1.28-1.87-3.27-2.13-3.98-2.16-1.7-.17-3.31 1-4.17 1-.86 0-2.19-.98-3.6-.95-1.85.03-3.56 1.08-4.51 2.73-1.92 3.33-.49 8.26 1.38 10.96.91 1.32 2 2.8 3.43 2.75 1.38-.06 1.9-.89 3.57-.89 1.66 0 2.14.89 3.6.86 1.49-.03 2.43-1.35 3.34-2.68 1.05-1.53 1.49-3.02 1.51-3.1-.03-.01-2.9-1.11-2.92-4.39zM14.3 4.4c.76-.92 1.27-2.2 1.13-3.47-1.09.04-2.42.73-3.2 1.64-.7.81-1.31 2.11-1.15 3.35 1.22.1 2.46-.62 3.22-1.52z" />
          </svg>
        }
      />
    </div>
  );
}

function ProviderButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 border border-white/15 bg-white/[0.03] rounded-xl py-3 text-sm font-medium hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {/* The spinner replaces the icon rather than the whole button, so the
          label stays readable and the row does not change height — a button
          that collapses to a spinner loses the one thing telling you which
          of the two you pressed. */}
      {disabled ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}
