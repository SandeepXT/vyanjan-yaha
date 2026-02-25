"use client";

import { useRouter } from "next/navigation";
import { X, Lock, ChefHat } from "lucide-react";
import { useEffect } from "react";

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthPromptModal({ open, onClose, message }: AuthPromptModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} />

      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
        style={{
          background: "var(--ink-100)",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "fadeUp 0.3s cubic-bezier(0.34,1.3,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: "var(--ink-400)" }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="px-8 pt-10 pb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative" style={{ background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.3)" }}>
            <ChefHat size={28} style={{ color: "var(--emerald)" }} />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--ink-100)", border: "1px solid var(--border-medium)" }}>
              <Lock size={11} style={{ color: "var(--saffron)" }} />
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--parchment)" }}>
            Sign in to continue
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--ink-400)" }}>
            {message || "Create a free account to add items to your cart and place orders."}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); router.push("/auth?tab=register"); }}
              className="w-full btn-primary h-12 rounded-2xl font-semibold text-base"
            >
              Create Free Account
            </button>
            <button
              onClick={() => { onClose(); router.push("/auth?tab=login"); }}
              className="w-full h-12 rounded-2xl font-semibold text-sm transition-all hover:bg-white/5"
              style={{ border: "1px solid var(--border-medium)", color: "var(--parchment-100)" }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <div className="px-8 py-4 border-t" style={{ borderColor: "var(--border-subtle)", background: "rgba(0,0,0,0.2)" }}>
          <p className="text-xs" style={{ color: "var(--ink-400)" }}>
            Free to join · Track your orders · Saved delivery details
          </p>
        </div>
      </div>
    </div>
  );
}
