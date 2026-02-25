"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X, Eye, EyeOff, User, Mail, Phone, Lock, MapPin, Loader2, CheckCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

const RoseLogo = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <rect width="36" height="36" rx="10" fill="#10B981"/>
    <ellipse cx="18" cy="13" rx="4" ry="5.5" fill="#F8F5F0" opacity="0.95"/>
    <ellipse cx="18" cy="13" rx="4" ry="5.5" fill="#F8F5F0" opacity="0.9" transform="rotate(72 18 13)"/>
    <ellipse cx="18" cy="13" rx="4" ry="5.5" fill="#F8F5F0" opacity="0.9" transform="rotate(144 18 13)"/>
    <ellipse cx="18" cy="13" rx="4" ry="5.5" fill="#F8F5F0" opacity="0.9" transform="rotate(216 18 13)"/>
    <ellipse cx="18" cy="13" rx="4" ry="5.5" fill="#F8F5F0" opacity="0.9" transform="rotate(288 18 13)"/>
    <circle cx="18" cy="13" r="2.8" fill="#059669"/>
    <line x1="18" y1="18" x2="18" y2="27" stroke="#F8F5F0" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 23 Q22 21 21 18" stroke="#F8F5F0" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </svg>
);

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");

  if (!open) return null;

  const resetForms = () => {
    setError("");
    setLoginEmail(""); setLoginPassword("");
    setRegName(""); setRegEmail(""); setRegPhone(""); setRegPassword(""); setRegAddress("");
    setSuccess(false);
  };

  const handleClose = () => { resetForms(); onClose(); };
  const switchTab = (t: "login" | "register") => { setTab(t); setError(""); };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!loginEmail.trim()) return setError("Please enter your email.");
    if (!loginPassword) return setError("Please enter your password.");
    setLoading(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 1200);
    } else {
      setError(result.error || "Login failed.");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!regName.trim() || regName.trim().length < 2) return setError("Enter your full name (min 2 characters).");
    if (!regEmail.trim() || !regEmail.includes("@")) return setError("Enter a valid email address.");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(regPhone.replace(/\s/g, ""))) return setError("Enter a valid 10-digit Indian mobile number.");
    if (regPassword.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const result = await register({ name: regName.trim(), email: regEmail.trim(), phone: regPhone.trim(), password: regPassword, address: regAddress.trim() });
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 1400);
    } else {
      setError(result.error || "Registration failed.");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] cart-backdrop flex items-center justify-center p-4" onClick={handleClose}>
        {/* Modal */}
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: "var(--ink-100)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            animation: "fadeUp 0.3s ease forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={handleClose} className="absolute top-4 right-4 btn-ghost p-2 rounded-lg z-10" aria-label="Close">
            <X size={18} />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex justify-center mb-3"><RoseLogo /></div>
            <h2 className="font-display font-bold text-2xl" style={{ color: "var(--parchment)" }}>
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--ink-400)" }}>
              {tab === "login" ? "Sign in to track your orders and more" : "Join Vyanjan Yaha for a premium experience"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mt-5 rounded-xl overflow-hidden" style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl"
                style={{
                  background: tab === t ? "var(--emerald)" : "transparent",
                  color: tab === t ? "var(--ink)" : "var(--ink-400)",
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success ? (
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.15)", border: "2px solid var(--emerald)" }}>
                <CheckCircle size={32} style={{ color: "var(--emerald)" }} />
              </div>
              <h3 className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>
                {tab === "login" ? "Welcome back!" : "Account created!"}
              </h3>
              <p className="text-sm mt-2" style={{ color: "var(--ink-400)" }}>Taking you in...</p>
            </div>
          ) : (
            <div className="px-8 py-6">
              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.4)", color: "#FCA5A5" }}>
                  {error}
                </div>
              )}

              {tab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <AuthField icon={<Mail size={14} />} label="Email Address" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" />
                  <AuthField icon={<Lock size={14} />} label="Password" type={showPass ? "text" : "password"} value={loginPassword} onChange={setLoginPassword} placeholder="Your password"
                    suffix={<button type="button" onClick={() => setShowPass(!showPass)} style={{ color: "var(--ink-400)" }}>{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                  />
                  <button type="submit" disabled={loading} className="w-full btn-primary h-12 rounded-xl flex items-center justify-center gap-2 font-semibold mt-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <AuthField icon={<User size={14} />} label="Full Name" value={regName} onChange={setRegName} placeholder="Arjun Sharma" />
                  <AuthField icon={<Mail size={14} />} label="Email Address" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@example.com" />
                  <AuthField icon={<Phone size={14} />} label="Mobile Number" type="tel" value={regPhone} onChange={setRegPhone} placeholder="9876543210" />
                  <AuthField icon={<Lock size={14} />} label="Password" type={showPass ? "text" : "password"} value={regPassword} onChange={setRegPassword} placeholder="Min. 6 characters"
                    suffix={<button type="button" onClick={() => setShowPass(!showPass)} style={{ color: "var(--ink-400)" }}>{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                  />
                  <AuthField icon={<MapPin size={14} />} label="Delivery Address (optional)" value={regAddress} onChange={setRegAddress} placeholder="Default delivery address" />
                  <button type="submit" disabled={loading} className="w-full btn-primary h-12 rounded-xl flex items-center justify-center gap-2 font-semibold mt-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create Account"}
                  </button>
                </form>
              )}

              <p className="text-center text-xs mt-5" style={{ color: "var(--ink-400)" }}>
                {tab === "login" ? (
                  <>Don&apos;t have an account?{" "}<button onClick={() => switchTab("register")} className="font-semibold hover:underline" style={{ color: "var(--emerald)" }}>Register here</button></>
                ) : (
                  <>Already have an account?{" "}<button onClick={() => switchTab("login")} className="font-semibold hover:underline" style={{ color: "var(--emerald)" }}>Sign in</button></>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AuthField({ icon, label, type = "text", value, onChange, placeholder, suffix }: {
  icon: React.ReactNode; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold block" style={{ color: "var(--parchment-200)" }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink-400)" }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-dark w-full h-11 pl-10 pr-10 rounded-xl text-sm"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">{suffix}</span>}
      </div>
    </div>
  );
}
