"use client";

import { useState } from "react";
import { Search, Leaf, X } from "lucide-react";

interface MenuFiltersProps {
  onCategoryChange: (cat: string) => void;
  onCuisineChange: (cuisine: string) => void;
  onVegChange: (veg: boolean) => void;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  activeCuisine: string;
  vegOnly: boolean;
  searchQuery: string;
}

const CATEGORIES = ["All", "Starters", "Mains", "Breads", "Desserts", "Beverages"];
const CUISINES = ["All", "Indian", "Western", "Fusion"];

export function MenuFilters({
  onCategoryChange,
  onCuisineChange,
  onVegChange,
  onSearchChange,
  activeCategory,
  activeCuisine,
  vegOnly,
  searchQuery,
}: MenuFiltersProps) {
  return (
    <div className="sticky top-[68px] z-40 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto px-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--ink-400)" }}
          />
          <input
            type="text"
            placeholder="Search dishes, cuisines..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-dark w-full h-11 pl-11 pr-10 rounded-xl text-sm"
            data-testid="menu-search"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-parchment transition-colors"
              style={{ color: "var(--ink-400)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                data-testid={`category-filter-${cat}`}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background:
                    activeCategory === cat
                      ? "var(--emerald)"
                      : "var(--ink-200)",
                  color:
                    activeCategory === cat ? "var(--ink)" : "var(--parchment-200)",
                  border: `1px solid ${
                    activeCategory === cat
                      ? "var(--emerald)"
                      : "var(--border-subtle)"
                  }`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <span
            className="hidden sm:block w-px h-5 mx-1"
            style={{ background: "var(--border-subtle)" }}
          />

          {/* Cuisines */}
          <div className="flex gap-2 flex-wrap">
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => onCuisineChange(c)}
                data-testid={`cuisine-filter-${c}`}
                className="text-xs font-mono-custom tracking-wider px-3 py-1.5 rounded-full transition-all duration-200 uppercase"
                style={{
                  background:
                    activeCuisine === c ? "rgba(245,158,11,0.15)" : "transparent",
                  color:
                    activeCuisine === c
                      ? "var(--saffron-light)"
                      : "var(--ink-400)",
                  border: `1px solid ${
                    activeCuisine === c ? "var(--saffron)" : "var(--border-subtle)"
                  }`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Veg toggle */}
          <button
            onClick={() => onVegChange(!vegOnly)}
            data-testid="veg-filter"
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ml-auto"
            style={{
              background: vegOnly
                ? "rgba(16,185,129,0.15)"
                : "var(--ink-200)",
              color: vegOnly ? "var(--emerald-light)" : "var(--parchment-200)",
              border: `1px solid ${vegOnly ? "var(--emerald)" : "var(--border-subtle)"}`,
            }}
          >
            <Leaf size={12} />
            VEG ONLY
          </button>
        </div>
      </div>
    </div>
  );
}
