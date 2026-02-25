import { User, RegisterPayload, LoginPayload } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// ─── Singleton Auth Store ─────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __vyanjan_users: Map<string, User & { passwordHash: string }> | undefined;
}

const users: Map<string, User & { passwordHash: string }> =
  globalThis.__vyanjan_users ??
  (globalThis.__vyanjan_users = new Map());

// Simple hash (for demo — in production use bcrypt)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `vh_${Math.abs(hash).toString(36)}_${password.length}`;
}

// Generate avatar color from name
export function getAvatarColor(name: string): string {
  const colors = [
    "#10B981", "#059669", "#F59E0B", "#D97706",
    "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444"
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Auth Operations ──────────────────────────────────────────────────────────

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export function registerUser(payload: RegisterPayload): AuthResult {
  // Check duplicate email
  const existing = Array.from(users.values()).find(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Validate
  if (!payload.name || payload.name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return { success: false, error: "Invalid email address" };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(payload.phone.replace(/\s/g, ""))) {
    return { success: false, error: "Enter a valid 10-digit Indian mobile number" };
  }

  const user: User = {
    id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    phone: payload.phone.trim(),
    address: payload.address ?? "",
    avatar: getAvatarColor(payload.name),
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, { ...user, passwordHash: simpleHash(payload.password) });
  return { success: true, user };
}

export function loginUser(payload: LoginPayload): AuthResult {
  const found = Array.from(users.values()).find(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (!found) {
    return { success: false, error: "No account found with this email" };
  }
  if (found.passwordHash !== simpleHash(payload.password)) {
    return { success: false, error: "Incorrect password" };
  }
  const { passwordHash: _, ...user } = found;
  return { success: true, user };
}

export function getUserById(id: string): User | undefined {
  const found = users.get(id);
  if (!found) return undefined;
  const { passwordHash: _, ...user } = found;
  return user;
}

export function getAllUsers(): User[] {
  return Array.from(users.values()).map(({ passwordHash: _, ...u }) => u);
}
