"use client";

import { useState, useMemo } from "react";
import { menuItems } from "@/data/menu";
import { MenuItem } from "@/lib/types";
import { MenuCard } from "@/components/menu/MenuCard";
import { MenuFilters } from "@/components/menu/MenuFilters";
import { MenuItemModal } from "@/components/menu/MenuItemModal";
import { AuthPromptModal } from "@/components/ui/AuthPromptModal";
import { UtensilsCrossed, TrendingUp, ChefHat, Sparkles } from "lucide-react";

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

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [cuisine, setCuisine] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (cuisine !== "All" && item.cuisine !== cuisine) return false;
      if (vegOnly && !item.isVeg) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [category, cuisine, vegOnly, search]);

  const popular = useMemo(() => menuItems.filter((m) => m.isPopular).slice(0, 4), []);
  const showingAll = category === "All" && cuisine === "All" && !vegOnly && !search;

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono-custom tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--emerald-light)" }}>
            <Sparkles size={12} />
            Multi-Cuisine · Premium Delivery
          </div>
          <h1 className="font-display font-black leading-none tracking-tight mb-4" style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", color: "var(--parchment)" }}>
            <span className="block">Vyanjan</span>
            <span className="block gradient-text italic">Yaha</span>
          </h1>
          <p className="text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: "var(--ink-400)" }}>
            From tandoor-fired breads to wood-fired pizzas. Every dish crafted with intention, delivered with care.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: <UtensilsCrossed size={16} />, label: `${menuItems.length} Dishes` },
              { icon: <ChefHat size={16} />, label: "Master Chefs" },
              { icon: <TrendingUp size={16} />, label: "45 min avg delivery" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-400)" }}>
                <span style={{ color: "var(--emerald)" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, var(--ink))" }} />
      </section>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <MenuFilters
        onCategoryChange={setCategory} onCuisineChange={setCuisine}
        onVegChange={setVegOnly} onSearchChange={setSearch}
        activeCategory={category} activeCuisine={cuisine}
        vegOnly={vegOnly} searchQuery={search}
      />

      {/* ── Menu Grid ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {showingAll && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="stripe-divider w-8" />
              <h2 className="font-display font-bold text-2xl" style={{ color: "var(--parchment)" }}>Most Popular</h2>
              <span className="text-xs font-mono-custom px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.15)", color: "var(--saffron-light)", border: "1px solid rgba(245,158,11,0.3)" }}>★ BESTSELLERS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popular.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i}
                  onOpenModal={setSelectedItem}
                  onAuthPrompt={() => setAuthPromptOpen(true)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="stripe-divider w-8" />
              <h2 className="font-display font-bold text-2xl" style={{ color: "var(--parchment)" }}>
                {showingAll ? "Full Menu" : search ? `Results for "${search}"` : category !== "All" ? category : cuisine !== "All" ? `${cuisine} Cuisine` : "Menu"}
              </h2>
            </div>
            <span className="text-sm" style={{ color: "var(--ink-400)" }}>{filtered.length} dish{filtered.length !== 1 ? "es" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--ink-200)" }}>
                <UtensilsCrossed size={32} style={{ color: "var(--ink-400)" }} />
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--parchment)" }}>No dishes found</h3>
              <p className="text-sm" style={{ color: "var(--ink-400)" }}>Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i}
                  onOpenModal={setSelectedItem}
                  onAuthPrompt={() => setAuthPromptOpen(true)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <RoseLogo />
            <div>
              <p className="font-display font-bold text-lg leading-none" style={{ color: "var(--parchment)" }}>Vyanjan Yaha</p>
              <p className="text-xs font-mono-custom tracking-widest uppercase mt-0.5" style={{ color: "var(--emerald)" }}>Premium Food Delivery</p>
            </div>
          </div>
          <p className="font-display italic text-base" style={{ color: "var(--ink-400)" }}>Every dish tells a story</p>
          <div className="text-xs text-center md:text-right" style={{ color: "var(--ink-400)" }}>
            <p>Multi-cuisine · Indian &amp; Western</p>
            <p className="mt-1">Avg. delivery: 45 minutes</p>
          </div>
        </div>
      </footer>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <MenuItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAuthPrompt={() => { setSelectedItem(null); setAuthPromptOpen(true); }}
      />
      <AuthPromptModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        message="Create a free account to add items to your cart and place orders from Vyanjan Yaha."
      />
    </div>
  );
}
