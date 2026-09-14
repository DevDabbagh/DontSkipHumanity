"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "guest" | "registered" | "subscriber";
  createdAt: string;
}

/**
 * The third-party sign-ins DSH offers.
 *
 * Deliberately narrower than Supabase's own provider union, which lists
 * twenty. This is the list the login modal and the mobile app both render,
 * and the two surfaces have to agree on it.
 */
export type SocialProvider = "google" | "apple";

/**
 * The language the visitor is reading the site in, from the URL prefix.
 *
 * Read from the path rather than from `useLocale()` on purpose: this is called
 * inside a callback in a provider that sits ABOVE LocaleProvider in the tree,
 * so the hook is not available here — and adding a dependency between the two
 * providers to pass a two-letter string is not worth the coupling.
 *
 * The default locale carries no prefix (`/films` is English, `/pt/films` is
 * Portuguese), so a first segment that isn't a known code means English.
 */
function currentLang(): string {
  if (typeof window === "undefined") return "en";
  const first = window.location.pathname.split("/")[1] ?? "";
  return ["pt", "ar"].includes(first) ? first : "en";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: SocialProvider) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  /// Changes the password of a signed-in user, checking the old one first.
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInWithProvider: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  changePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user profile from public_users table
  const loadProfile = useCallback(async (authUser: User) => {
    try {
      // Try to load existing profile
      const { data, error } = await supabase
        .from("public_users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!error && data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name || authUser.user_metadata?.full_name || "User",
          avatarUrl: data.avatar_url || authUser.user_metadata?.avatar_url,
          role: data.role || "registered",
          createdAt: data.created_at,
        });
      } else {
        // Profile doesn't exist yet — create it
        const newProfile = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || "User",
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: "registered",
        };

        await supabase.from("public_users").upsert(newProfile, { onConflict: "id" });

        setProfile({
          id: authUser.id,
          email: authUser.email!,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url || undefined,
          role: "registered",
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Fallback — set basic profile from auth metadata
      setProfile({
        id: authUser.id,
        email: authUser.email!,
        fullName: authUser.user_metadata?.full_name || "User",
        avatarUrl: authUser.user_metadata?.avatar_url,
        role: "registered",
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
        /* Attach any guest donations made with this same email, so someone
           who donated before signing up finds their history already there.
           The function takes no arguments and only ever claims rows matching
           the caller's own verified email (migration 020). Best-effort:
           a failure here must never block signing in. */
        supabase.rpc("link_my_donations").then(({ error }) => {
          if (error) console.warn("[auth] link_my_donations", error.message);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // `locale` is read by the send-auth-email Edge Function to decide
        // which language to write the confirmation email in. It runs before
        // any profile row exists, so user metadata is the only place it can
        // look — and the site is read in three languages.
        data: { full_name: fullName, locale: currentLang() },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  // One call for both providers rather than one function each. The app's
  // login screens offer exactly these two, and the only thing that differs is
  // the string — a second near-identical function would drift from the first
  // the moment either needed an option the other did not.
  const signInWithProvider = useCallback(async (provider: SocialProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

  /**
   * Changes the password of someone who is already signed in.
   *
   * WHY THE OLD PASSWORD IS CHECKED HERE
   *
   * `updateUser` does not ask for it — a valid session is all Supabase
   * requires. That is fine for the reset flow, where the user just proved
   * ownership of the mailbox. It is not fine from a settings page: sessions
   * last for weeks, so an unattended laptop would be enough for someone to
   * change the password and lock the owner out of their own account.
   *
   * So we re-authenticate first. `signInWithPassword` against the user's own
   * address either succeeds — proving they know the current password — or
   * fails, and we stop. This is the same reason banks ask for a password you
   * already typed an hour ago.
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.email) return { error: "Not signed in." };

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    // Deliberately not "wrong password" — that is what it means, but this
    // message is also what a Google-only account sees, and telling those
    // users their password is wrong sends them hunting for one they never set.
    if (reauthError) {
      return { error: "That current password didn't match." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const dbUpdates: Record<string, string | undefined> = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

      const { error } = await supabase
        .from("public_users")
        .update(dbUpdates)
        .eq("id", user.id);

      if (!error) {
        setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      }

      return { error: error?.message ?? null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Update failed" };
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithProvider,
        signOut,
        resetPassword,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
