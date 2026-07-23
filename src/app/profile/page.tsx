"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await updateProfile({ fullName });
    if (error) {
      setMessage({ type: "error", text: error });
    } else {
      setMessage({ type: "success", text: "Profile updated." });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <main className="relative min-h-screen">
      <div className="film-grain" />
      <Navbar />

      <div className="pt-28 sm:pt-32 pb-20 px-5 sm:px-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B59B6] to-[#1ABC9C] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.fullName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-[#1ABC9C] mt-1 capitalize">{profile?.role ?? "registered"} account</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-semibold mb-6">Edit Profile</h2>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9B59B6]/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email ?? ""}
                disabled
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Account Type</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white capitalize">{profile?.role ?? "registered"}</span>
                {profile?.role !== "subscriber" && (
                  <span className="text-[10px] text-[#9B59B6] bg-[#9B59B6]/10 px-2 py-0.5 rounded-full">
                    Upgrade to subscriber for full access
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-semibold rounded-xl px-6 py-2.5 text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Account section */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <p className="text-sm text-gray-500 mb-4">
            Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—"}
          </p>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#E74C3C] hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
