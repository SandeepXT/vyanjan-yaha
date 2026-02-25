"use client";

import Image from "next/image";
import { useState } from "react";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { Star, Clock, Flame, Plus, Minus, CheckCircle, Lock } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  index?: number;
  onOpenModal?: (item: MenuItem) => void;
  onAuthPrompt?: () => void;
}

export function MenuCard({ item, index = 0, onOpenModal, onAuthPrompt }: MenuCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const qty = getItemQuantity(item.id);
  const inCart = isInCart(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthPrompt?.();
      return;
    }
    setIsAdding(true);
    addItem(item);
    setTimeout(() => setIsAdding(false), 700);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, qty + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty === 1) removeItem(item.id);
    else updateQuantity(item.id, qty - 1);
  };

  return (
    <article
      className="card-dark rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
      style={{ animationDelay: `${index * 0.06}s`, animation: "fadeUp 0.5s ease forwards", opacity: 0 }}
      data-testid="menu-card"
      onClick={() => onOpenModal?.(item)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "var(--ink-200)" }}>🍽️</div>
        )}

        <div className="absolute inset-0 transition-opacity duration-300" style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(10,10,10,0.92) 100%)" }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-none flex items-center gap-1 ${item.isVeg ? "badge-veg" : "badge-nonveg"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-400" : "bg-red-400"}`} />
            {item.isVeg ? "VEG" : "NON-VEG"}
          </span>
          {item.isSpicy && (
            <span className="badge-spicy text-[10px] font-bold px-2 py-0.5 rounded-full leading-none flex items-center gap-1">
              <Flame size={9} /> SPICY
            </span>
          )}
        </div>
        {item.isPopular && (
          <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--saffron)", color: "var(--ink)" }}>★ POPULAR</div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-mono-custom tracking-widest px-2 py-0.5 rounded uppercase" style={{ background: "rgba(10,10,10,0.75)", color: "var(--parchment-200)", border: "1px solid var(--border-subtle)" }}>
            {item.cuisine}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.7)", color: "var(--parchment)", border: "1px solid var(--border-medium)" }}>
            Tap to view details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg leading-tight mb-2" style={{ color: "var(--parchment)" }}>{item.name}</h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--ink-400)", lineHeight: 1.7 }}>{item.description}</p>
        </div>

        {/* Rating + time */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-400)" }}>
          <span className="flex items-center gap-1">
            <Star size={11} fill="var(--saffron)" stroke="var(--saffron)" />
            <span className="font-semibold" style={{ color: "var(--parchment-200)" }}>{item.rating}</span>
          </span>
          <span className="w-px h-3" style={{ background: "var(--border-subtle)" }} />
          <span className="flex items-center gap-1"><Clock size={11} /> {item.prepTime} min</span>
          <span className="w-px h-3" style={{ background: "var(--border-subtle)" }} />
          <span>{item.category}</span>
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>{formatCurrency(item.price)}</span>

          {!isAuthenticated ? (
            /* Guest: show locked add button */
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--ink-200)", border: "1px solid var(--border-medium)", color: "var(--ink-400)" }}
            >
              <Lock size={13} />
              Add
            </button>
          ) : !inCart ? (
            <button onClick={handleAdd} data-testid="add-to-cart-btn" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold btn-primary">
              {isAdding ? <><CheckCircle size={14} /> Added!</> : <><Plus size={14} /> Add</>}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: "var(--ink-200)", border: "1px solid var(--border-medium)" }}>
              <button className="qty-btn" onClick={handleDecrease} aria-label="Decrease" data-testid="decrease-qty-btn"><Minus size={12} /></button>
              <span className="w-7 text-center text-sm font-bold" style={{ color: "var(--parchment)" }} data-testid="item-quantity">{qty}</span>
              <button className="qty-btn" onClick={handleIncrease} aria-label="Increase" data-testid="increase-qty-btn"><Plus size={12} /></button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
