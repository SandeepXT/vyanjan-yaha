"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { DeliveryDetails, PlaceOrderPayload } from "@/lib/types";
import {
  X, ShoppingBag, Plus, Minus, Trash2, ChevronRight,
  ArrowLeft, MapPin, Phone, User, FileText, Loader2, CheckCircle,
} from "lucide-react";

type DrawerStep = "cart" | "checkout" | "placing" | "success";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;
const TAX_RATE = 0.05;

const emptyDelivery: DeliveryDetails = { name: "", phone: "", address: "", landmark: "", instructions: "" };

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<DrawerStep>("cart");
  const [delivery, setDelivery] = useState<DeliveryDetails>(emptyDelivery);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("cart");
        setErrors({});
        setPlacedOrderId(null);
      }, 300);
    }
  }, [open]);

  const subtotal = cart.total;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + deliveryFee + taxes;

  function validateDelivery(): boolean {
    const e: Record<string, string> = {};
    if (!delivery.name.trim() || delivery.name.trim().length < 2) e.name = "Enter your full name";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!delivery.phone || !phoneRegex.test(delivery.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit mobile number";
    if (!delivery.address.trim() || delivery.address.trim().length < 10) e.address = "Enter a complete delivery address (min. 10 chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validateDelivery()) return;
    setIsSubmitting(true);
    setStep("placing");

    const payload: PlaceOrderPayload = {
      items: items.map((ci) => ({ menuItemId: ci.menuItem.id, quantity: ci.quantity })),
      deliveryDetails: delivery,
      ...(user ? { userId: user.id } : {}),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const orderId = data.data.id;
        setPlacedOrderId(orderId);
        clearCart();
        setStep("success");

        // Wait 1.8s showing success, then navigate — order is confirmed in DB by then
        setTimeout(() => {
          onClose();
          router.push(`/orders/${orderId}`);
        }, 1800);
      } else {
        setStep("checkout");
        setErrors({ submit: data.error || "Failed to place order. Please try again." });
      }
    } catch {
      setStep("checkout");
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 cart-backdrop" onClick={onClose} aria-hidden />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal
        aria-label="Cart"
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          background: "var(--ink-100)",
          borderLeft: "1px solid var(--border-subtle)",
          animation: "slideRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {step === "cart" && (
          <>
            <DrawerHeader title="Your Cart" subtitle={`${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""}`} onClose={onClose} />
            {items.length === 0 ? (
              <EmptyCart onClose={onClose} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {items.map((ci) => (
                    <CartItemRow
                      key={ci.menuItem.id}
                      item={ci}
                      onIncrease={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)}
                      onDecrease={() => { if (ci.quantity === 1) removeItem(ci.menuItem.id); else updateQuantity(ci.menuItem.id, ci.quantity - 1); }}
                      onRemove={() => removeItem(ci.menuItem.id)}
                    />
                  ))}
                </div>

                <div className="px-5 py-5 border-t space-y-3" style={{ borderColor: "var(--border-subtle)" }}>
                  <BillRow label="Subtotal" value={formatCurrency(subtotal)} />
                  <BillRow label="Delivery" value={deliveryFee === 0 ? "FREE 🎉" : formatCurrency(deliveryFee)} highlight={deliveryFee === 0} />
                  <BillRow label="GST (5%)" value={formatCurrency(taxes)} />
                  {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                    <p className="text-xs" style={{ color: "var(--saffron)" }}>
                      Add {formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
                    </p>
                  )}
                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
                    <span className="font-display font-bold text-lg" style={{ color: "var(--parchment)" }}>Total</span>
                    <span className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>{formatCurrency(total)}</span>
                  </div>
                  <button
                    onClick={() => setStep("checkout")}
                    className="w-full btn-primary h-12 rounded-xl flex items-center justify-center gap-2 text-base font-semibold"
                    data-testid="proceed-to-checkout-btn"
                  >
                    Proceed to Checkout <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === "checkout" && (
          <>
            <DrawerHeader title="Delivery Details" subtitle="Where should we bring your feast?" onClose={onClose} onBack={() => setStep("cart")} />
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <Field icon={<User size={15} />} label="Full Name" placeholder="e.g. Arjun Sharma" value={delivery.name} onChange={(v) => setDelivery((d) => ({ ...d, name: v }))} error={errors.name} required testId="checkout-name" />
              <Field icon={<Phone size={15} />} label="Mobile Number" placeholder="10-digit mobile number" value={delivery.phone} onChange={(v) => setDelivery((d) => ({ ...d, phone: v }))} error={errors.phone} type="tel" required testId="checkout-phone" />
              <Field icon={<MapPin size={15} />} label="Delivery Address" placeholder="House/Flat, Street, Area, City, PIN" value={delivery.address} onChange={(v) => setDelivery((d) => ({ ...d, address: v }))} error={errors.address} multiline required testId="checkout-address" />
              <Field icon={<MapPin size={15} />} label="Landmark (optional)" placeholder="Near, opposite, behind..." value={delivery.landmark || ""} onChange={(v) => setDelivery((d) => ({ ...d, landmark: v }))} testId="checkout-landmark" />
              <Field icon={<FileText size={15} />} label="Cooking / Delivery Instructions (optional)" placeholder="Less spicy, no onion, ring bell..." value={delivery.instructions || ""} onChange={(v) => setDelivery((d) => ({ ...d, instructions: v }))} multiline testId="checkout-instructions" />
              {errors.submit && (
                <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid var(--crimson)", color: "#FCA5A5" }}>
                  {errors.submit}
                </p>
              )}
            </div>
            <div className="px-5 py-5 border-t space-y-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center justify-between text-sm" style={{ color: "var(--ink-400)" }}>
                <span>{cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}</span>
                <span style={{ color: deliveryFee === 0 ? "var(--emerald)" : "var(--ink-400)" }}>
                  {deliveryFee === 0 ? "Free delivery!" : `+${formatCurrency(deliveryFee)} delivery`}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full btn-primary h-12 rounded-xl flex items-center justify-center gap-2 text-base font-semibold"
                data-testid="place-order-btn"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order · {formatCurrency(total)} <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </>
        )}

        {step === "placing" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "2px solid var(--emerald)" }}>
              <Loader2 size={34} className="animate-spin" style={{ color: "var(--emerald)" }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--parchment)" }}>Placing your order...</h3>
              <p className="text-sm" style={{ color: "var(--ink-400)" }}>Sending your order to the kitchen</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "2px solid var(--emerald)" }}>
              <CheckCircle size={38} style={{ color: "var(--emerald)" }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--parchment)" }}>Order Confirmed!</h3>
              {placedOrderId && (
                <p className="font-mono-custom text-sm font-bold mb-2" style={{ color: "var(--emerald)" }}>
                  {placedOrderId}
                </p>
              )}
              <p className="text-sm" style={{ color: "var(--ink-400)" }}>Redirecting to live tracking...</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: "var(--emerald)", animation: `pulseSoft 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DrawerHeader({ title, subtitle, onClose, onBack }: { title: string; subtitle: string; onClose: () => void; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      {onBack && (
        <button onClick={onBack} className="btn-ghost p-2 rounded-lg -ml-2" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex-1">
        <h2 className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>{subtitle}</p>
      </div>
      <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Close" data-testid="close-cart-btn">
        <X size={18} />
      </button>
    </div>
  );
}

function CartItemRow({ item, onIncrease, onDecrease, onRemove }: {
  item: { menuItem: { id: string; name: string; price: number; isVeg: boolean }; quantity: number };
  onIncrease: () => void; onDecrease: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }} data-testid="cart-item">
      <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-0.5 ${item.menuItem.isVeg ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--parchment)" }}>{item.menuItem.name}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>{formatCurrency(item.menuItem.price)} each</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="qty-btn" onClick={onDecrease} aria-label="Decrease"><Minus size={10} /></button>
        <span className="text-sm font-bold w-6 text-center" style={{ color: "var(--parchment)" }}>{item.quantity}</span>
        <button className="qty-btn" onClick={onIncrease} aria-label="Increase"><Plus size={10} /></button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold w-14 text-right" style={{ color: "var(--parchment)" }}>{formatCurrency(item.menuItem.price * item.quantity)}</span>
        <button onClick={onRemove} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: "var(--ink-400)" }} aria-label="Remove" data-testid="remove-item-btn">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function BillRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--ink-400)" }}>{label}</span>
      <span className="font-medium" style={{ color: highlight ? "var(--emerald-light)" : "var(--parchment-200)" }}>{value}</span>
    </div>
  );
}

function Field({ icon, label, placeholder, value, onChange, error, type = "text", multiline = false, required = false, testId }: {
  icon: React.ReactNode; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; type?: string;
  multiline?: boolean; required?: boolean; testId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--parchment-200)" }}>
        {label}{required && <span style={{ color: "var(--crimson)" }}>*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink-400)" }}>{icon}</span>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            data-testid={testId}
            className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm resize-none min-h-[80px]"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            data-testid={testId}
            className="input-dark w-full h-11 pl-10 pr-4 rounded-xl text-sm"
          />
        )}
      </div>
      {error && <p className="text-xs" style={{ color: "#FCA5A5" }}>{error}</p>}
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "var(--ink-200)" }}>
        <ShoppingBag size={32} style={{ color: "var(--ink-400)" }} />
      </div>
      <div>
        <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--parchment)" }}>Your cart is empty</h3>
        <p className="text-sm" style={{ color: "var(--ink-400)" }}>Add some delicious dishes from our menu</p>
      </div>
      <button onClick={onClose} className="btn-primary px-8 py-3 rounded-xl font-semibold">Browse Menu</button>
    </div>
  );
}
