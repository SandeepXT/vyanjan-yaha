"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

function AuthPageInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const redirect = searchParams.get("redirect") || "/";

  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const { login, register } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(loginEmail, loginPass);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push(redirect), 1000);
    } else {
      setError(res.error || "Login failed");
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await register({ name: regName, email: regEmail, phone: regPhone, password: regPass, address: regAddress });
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push(redirect), 1000);
    } else {
      setError(res.error || "Registration failed");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: "80px" }}>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(16,185,129,0.15)", border: "2px solid var(--emerald)" }}>
            <CheckCircle size={38} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 className="font-display font-bold text-2xl" style={{ color: "var(--parchment)" }}>
            {tab === "login" ? "Welcome back!" : "Account created!"}
          </h2>
          <p className="text-sm" style={{ color: "var(--ink-400)" }}>Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ paddingTop: "100px" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)" }} />

      <div className="relative w-full max-w-md">
        {/* Back to menu */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 group hover:text-parchment transition-colors" style={{ color: "var(--ink-400)" }}>
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </Link>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: "var(--ink-100)", border: "1px solid var(--border-subtle)" }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
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
            </div>
            <div>
              <p className="font-display font-bold text-xl leading-none" style={{ color: "var(--parchment)" }}>Vyanjan Yaha</p>
              <p className="text-xs font-mono-custom tracking-widest uppercase mt-0.5" style={{ color: "var(--emerald)" }}>Premium Food Delivery</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8 gap-1" style={{ background: "var(--ink-200)" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 capitalize"
                style={{
                  background: tab === t ? "var(--emerald)" : "transparent",
                  color: tab === t ? "var(--ink)" : "var(--ink-400)",
                }}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "var(--parchment)" }}>
                Welcome back
              </h2>
              <AuthField icon={<Mail size={15}/>} label="Email Address" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" required />
              <div className="relative">
                <AuthField icon={<Lock size={15}/>} label="Password" type={showPass ? "text" : "password"} value={loginPass} onChange={setLoginPass} placeholder="Your password" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9" style={{ color: "var(--ink-400)" }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>

              {error && <ErrorMsg msg={error} />}

              <button type="submit" disabled={loading} className="w-full btn-primary h-12 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin"/> Signing in...</> : "Sign In"}
              </button>

              <p className="text-center text-sm" style={{ color: "var(--ink-400)" }}>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setTab("register")} className="font-semibold" style={{ color: "var(--emerald)" }}>Create one</button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "var(--parchment)" }}>
                Create your account
              </h2>
              <AuthField icon={<User size={15}/>} label="Full Name" value={regName} onChange={setRegName} placeholder="Arjun Sharma" required />
              <AuthField icon={<Mail size={15}/>} label="Email Address" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@example.com" required />
              <AuthField icon={<Phone size={15}/>} label="Mobile Number" type="tel" value={regPhone} onChange={setRegPhone} placeholder="10-digit mobile number" required />
              <div className="relative">
                <AuthField icon={<Lock size={15}/>} label="Password" type={showPass ? "text" : "password"} value={regPass} onChange={setRegPass} placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9" style={{ color: "var(--ink-400)" }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <AuthField icon={<MapPin size={15}/>} label="Default Address (optional)" value={regAddress} onChange={setRegAddress} placeholder="Your delivery address" multiline />

              {error && <ErrorMsg msg={error} />}

              <button type="submit" disabled={loading} className="w-full btn-primary h-12 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin"/> Creating account...</> : "Create Account"}
              </button>

              <p className="text-center text-sm" style={{ color: "var(--ink-400)" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="font-semibold" style={{ color: "var(--emerald)" }}>Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthField({ icon, label, type = "text", value, onChange, placeholder, required, multiline }: {
  icon: React.ReactNode; label: string; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--parchment-200)" }}>
        {label}{required && <span style={{ color: "var(--crimson)" }}>*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink-400)" }}>{icon}</span>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm resize-none min-h-[72px]" />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="input-dark w-full h-11 pl-10 pr-10 rounded-xl text-sm" required={required} />
        )}
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid var(--crimson)", color: "#FCA5A5" }}>
      {msg}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin" style={{ color: "var(--emerald)" }} /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
