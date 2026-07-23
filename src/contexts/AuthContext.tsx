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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
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
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
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
        signInWithGoogle,
        signOut,
        resetPassword,
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
