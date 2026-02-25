"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getAvatarColor, getInitials } from "@/lib/auth-store";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthPromptModal } from "@/components/ui/AuthPromptModal";
import { ShoppingBag, Menu, X, User, Package, LogOut, ChevronDown } from "lucide-react";

const RoseLogo = () => (
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
);

export function Navbar() {
  const { cart } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cart.itemCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(t);
    }
  }, [cart.itemCount]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleCartClick() {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    setCartOpen(true);
  }

  const avatarColor = user ? getAvatarColor(user.name) : "#10B981";
  const initials = user ? getInitials(user.name) : "";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-white/5 py-3" : "py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex-shrink-0"><RoseLogo /></div>
            <div className="leading-none">
              <span className="font-display font-bold text-xl tracking-tight block" style={{ color: "var(--parchment)" }}>Vyanjan</span>
              <span className="text-[10px] font-mono-custom tracking-[0.25em] uppercase" style={{ color: "var(--emerald)", lineHeight: 1 }}>Yaha</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: "var(--parchment-100)" }}>Menu</Link>
            {isAuthenticated && (
              <Link href="/orders" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: "var(--parchment-100)" }}>My Orders</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Cart button — only shown to logged-in users OR shows auth prompt */}
            <button
              onClick={handleCartClick}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                isAuthenticated ? "btn-primary" : "btn-ghost"
              } ${cartBounce && isAuthenticated ? "animate-bounce" : ""}`}
              style={!isAuthenticated ? { border: "1px solid var(--border-subtle)", color: "var(--ink-400)" } : {}}
              aria-label="Cart"
            >
              <ShoppingBag size={17} />
              {isAuthenticated && cart.itemCount > 0 && (
                <>
                  <span className="text-sm font-semibold hidden sm:block">{cart.itemCount} Item{cart.itemCount > 1 ? "s" : ""}</span>
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full text-xs font-black flex items-center justify-center leading-none" style={{ background: "var(--saffron)", color: "var(--ink)" }}>
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </span>
                </>
              )}
              {isAuthenticated && cart.itemCount === 0 && (
                <span className="text-sm font-semibold hidden sm:block">Cart</span>
              )}
            </button>

            {/* Auth area */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-display flex-shrink-0" style={{ background: avatarColor, color: "#fff" }}>
                    {initials}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-none" style={{ color: "var(--parchment)" }}>{user.name.split(" ")[0]}</p>
                    <p className="text-[10px] mt-0.5 leading-none" style={{ color: "var(--ink-400)" }}>Account</p>
                  </div>
                  <ChevronDown size={13} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} style={{ color: "var(--ink-400)" }} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50" style={{ background: "var(--ink-100)", border: "1px solid var(--border-medium)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black font-display" style={{ background: avatarColor, color: "#fff" }}>{initials}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--parchment)" }}>{user.name}</p>
                          <p className="text-xs truncate" style={{ color: "var(--ink-400)" }}>{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <DropdownItem icon={<User size={14}/>} label="My Profile" onClick={() => { setProfileOpen(false); router.push("/profile"); }} />
                      <DropdownItem icon={<Package size={14}/>} label="Order History" onClick={() => { setProfileOpen(false); router.push("/orders"); }} />
                    </div>
                    <div className="border-t py-1" style={{ borderColor: "var(--border-subtle)" }}>
                      <DropdownItem icon={<LogOut size={14}/>} label="Sign Out" onClick={() => { setProfileOpen(false); logout(); router.push("/"); }} danger />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all btn-primary">
                <User size={15} />
                Sign In
              </Link>
            )}

            <button className="md:hidden btn-ghost p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-1">
            <Link href="/" className="text-base font-medium py-3 hover:text-emerald-400 transition-colors" style={{ color: "var(--parchment-100)" }} onClick={() => setMobileOpen(false)}>Menu</Link>
            {isAuthenticated ? (
              <>
                <Link href="/orders" className="text-base font-medium py-3 hover:text-emerald-400 transition-colors" style={{ color: "var(--parchment-100)" }} onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link href="/profile" className="text-base font-medium py-3 hover:text-emerald-400 transition-colors" style={{ color: "var(--parchment-100)" }} onClick={() => setMobileOpen(false)}>My Profile</Link>
                <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }} className="text-left text-base font-medium py-3" style={{ color: "#FCA5A5" }}>Sign Out</button>
              </>
            ) : (
              <Link href="/auth" className="text-base font-medium py-3" style={{ color: "var(--emerald)" }} onClick={() => setMobileOpen(false)}>
                Sign In / Register
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer — only for authenticated users */}
      {isAuthenticated && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}

      {/* Auth Prompt */}
      <AuthPromptModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        message="Sign in to view your cart and place orders."
      />
    </>
  );
}

function DropdownItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-white/[0.04]" style={{ color: danger ? "#FCA5A5" : "var(--parchment-100)" }}>
      <span style={{ color: danger ? "#FCA5A5" : "var(--ink-400)" }}>{icon}</span>
      {label}
    </button>
  );
}
