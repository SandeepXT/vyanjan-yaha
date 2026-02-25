"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { X, Star, Clock, Flame, Plus, Minus, CheckCircle, Leaf, Drumstick, Lock } from "lucide-react";

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAuthPrompt?: () => void;
}

export function MenuItemModal({ item, onClose, onAuthPrompt }: MenuItemModalProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);

  const qty = item ? getItemQuantity(item.id) : 0;
  const inCart = item ? isInCart(item.id) : false;

  useEffect(() => { setImageError(false); }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  function handleAdd() {
    if (!isAuthenticated) {
      onClose();
      onAuthPrompt?.();
      return;
    }
    setAdding(true);
    addItem(item!);
    setTimeout(() => setAdding(false), 700);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} />

      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: "var(--ink-100)",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "fadeUp 0.3s cubic-bezier(0.34,1.3,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/30" style={{ background: "rgba(0,0,0,0.5)", color: "var(--parchment)" }} aria-label="Close">
          <X size={18} />
        </button>

        {/* Image */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "clamp(200px, 35vh, 320px)" }}>
          {!imageError ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" onError={() => setImageError(true)} sizes="(max-width: 768px) 100vw, 672px" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: "var(--ink-200)" }}>🍽️</div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.0) 40%, rgba(26,26,26,0.95) 100%)" }} />

          {/* Badges on image */}
          <div className="absolute bottom-4 left-5 flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${item.isVeg ? "badge-veg" : "badge-nonveg"}`}>
              {item.isVeg ? <Leaf size={11} /> : <Drumstick size={11} />}
              {item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
            </span>
            {item.isSpicy && (
              <span className="badge-spicy inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full">
                <Flame size={11} /> Spicy
              </span>
            )}
            {item.isPopular && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--saffron)", color: "var(--ink)" }}>★ Popular</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="font-display font-bold text-3xl leading-tight" style={{ color: "var(--parchment)" }}>{item.name}</h2>
                <span className="text-xs font-mono-custom tracking-widest px-3 py-1.5 rounded-full uppercase flex-shrink-0 mt-1" style={{ background: "var(--ink-200)", color: "var(--parchment-200)", border: "1px solid var(--border-subtle)" }}>{item.cuisine}</span>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--saffron-light)" }}>
                  <Star size={14} fill="currentColor" stroke="currentColor" />{item.rating} rating
                </span>
                <span className="w-px h-4" style={{ background: "var(--border-subtle)" }} />
                <span className="flex items-center gap-1.5" style={{ color: "var(--ink-400)" }}><Clock size={14} /> {item.prepTime} min prep</span>
                <span className="w-px h-4" style={{ background: "var(--border-subtle)" }} />
                <span style={{ color: "var(--ink-400)" }}>{item.category}</span>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border-subtle)" }} />

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--emerald)" }}>About this dish</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--parchment-200)", lineHeight: 1.85 }}>{item.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[item.cuisine, item.category, item.isVeg ? "Vegetarian" : null, item.isSpicy ? "Spicy" : null, item.isPopular ? "Bestseller" : null].filter(Boolean).map((tag) => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "var(--ink-200)", color: "var(--ink-400)", border: "1px solid var(--border-subtle)" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t flex items-center justify-between gap-4" style={{ borderColor: "var(--border-subtle)", background: "var(--ink-100)" }}>
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--ink-400)" }}>Price per serving</p>
            <p className="font-display font-black text-3xl" style={{ color: "var(--parchment)" }}>{formatCurrency(item.price)}</p>
          </div>

          {!isAuthenticated ? (
            /* Guest — show login prompt button */
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-base font-bold transition-all"
              style={{ background: "var(--ink-200)", border: "1px solid var(--border-medium)", color: "var(--parchment-100)" }}
            >
              <Lock size={16} style={{ color: "var(--saffron)" }} />
              Sign in to Order
            </button>
          ) : !inCart ? (
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl text-base font-bold">
              {adding ? <><CheckCircle size={18} /> Added!</> : <><Plus size={18} /> Add to Cart</>}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl" style={{ background: "var(--ink-200)", border: "1px solid var(--border-medium)" }}>
                <button className="qty-btn w-9 h-9" onClick={() => { if (qty === 1) removeItem(item.id); else updateQuantity(item.id, qty - 1); }} aria-label="Decrease"><Minus size={14} /></button>
                <span className="w-8 text-center text-lg font-bold" style={{ color: "var(--parchment)" }}>{qty}</span>
                <button className="qty-btn w-9 h-9" onClick={() => updateQuantity(item.id, qty + 1)} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--ink-400)" }}>In cart</p>
                <p className="font-display font-bold text-xl" style={{ color: "var(--emerald)" }}>{formatCurrency(item.price * qty)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
