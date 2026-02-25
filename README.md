# 🍽️ Vyanjan Yaha — Premium Food Delivery App

A full-stack food ordering application built with **Next.js 14 App Router**, featuring a premium editorial UI, real-time order tracking via Server-Sent Events, and comprehensive TDD coverage.

---

## ✨ Features

- **Multi-cuisine menu** — Indian, Western, and Fusion dishes with rich descriptions
- **Cart management** — Add/remove items, quantity controls, persistent state via React Context
- **Order placement** — Full checkout flow with delivery details and validation
- **Real-time order tracking** — Live status updates using Server-Sent Events (SSE)
- **Status progression** — Automatic simulated status updates (Order Received → Confirmed → Preparing → Quality Check → Out for Delivery → Delivered)
- **Responsive design** — Mobile-first, works on all screen sizes
- **Test-driven development** — 40+ tests covering API logic, cart operations, utilities, and validation

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS with custom design tokens |
| Animations | CSS animations + transitions (Framer Motion ready) |
| Fonts | Playfair Display + DM Sans + DM Mono |
| Icons | Lucide React |
| Real-time | Server-Sent Events (SSE) |
| Storage | In-memory (Map-based, resets on server restart) |
| Testing | Jest + React Testing Library + ts-jest |
| Linting | ESLint (Next.js config) |

---

## 🗂️ Project Structure

```
vyanjan-yaha/
├── app/
│   ├── api/
│   │   ├── menu/route.ts            # GET /api/menu
│   │   └── orders/
│   │       ├── route.ts             # GET, POST /api/orders
│   │       └── [id]/
│   │           ├── route.ts         # GET /api/orders/:id
│   │           ├── status/route.ts  # PATCH /api/orders/:id/status
│   │           └── stream/route.ts  # GET /api/orders/:id/stream (SSE)
│   ├── orders/
│   │   ├── page.tsx                 # Orders list page
│   │   └── [id]/page.tsx            # Order detail + live tracking
│   ├── page.tsx                     # Menu / Homepage
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles + design system
├── components/
│   ├── ui/Navbar.tsx
│   ├── menu/MenuCard.tsx
│   ├── menu/MenuFilters.tsx
│   ├── cart/CartDrawer.tsx
│   └── order/OrderTracker.tsx
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── store.ts                     # In-memory store + business logic
│   ├── utils.ts                     # Formatters + status helpers
│   ├── cart-context.tsx             # Cart state (React Context + useReducer)
│   └── use-order-status.ts          # SSE hook for real-time updates
├── data/
│   └── menu.ts                      # 18 menu items (Indian, Western, Fusion)
├── __tests__/
│   ├── api/
│   │   ├── menu.test.ts             # Menu data validation
│   │   ├── orders.test.ts           # Order CRUD + validation (30+ tests)
│   │   └── utils.test.ts            # Utility function tests
│   └── components/
│       └── cart.test.ts             # CartContext unit tests
└── jest.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/vyanjan-yaha.git
cd vyanjan-yaha
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🔌 API Reference

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=Mains` | Filter by category |
| GET | `/api/menu?cuisine=Indian` | Filter by cuisine |
| GET | `/api/menu?veg=true` | Veg-only items |
| GET | `/api/menu?q=biryani` | Search items |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/:id` | Get a specific order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/:id/stream` | SSE stream for real-time updates |

### POST /api/orders — Payload

```json
{
  "items": [
    { "menuItemId": "item-001", "quantity": 2 },
    { "menuItemId": "item-005", "quantity": 1 }
  ],
  "deliveryDetails": {
    "name": "Arjun Sharma",
    "phone": "9876543210",
    "address": "123 MG Road, Connaught Place, New Delhi 110001",
    "landmark": "Near Metro Station",
    "instructions": "Please call on arrival"
  }
}
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0A0A0A` (ink) |
| Surface | `#1A1A1A` (ink-100) |
| Brand | `#10B981` (emerald) |
| Accent | `#F59E0B` (saffron) |
| Text | `#F8F5F0` (parchment) |
| Heading Font | Playfair Display |
| Body Font | DM Sans |
| Mono Font | DM Mono |

---

## 📊 Order Status Flow

```
ORDER_RECEIVED (0s)
      ↓ 8s
  CONFIRMED
      ↓ 12s
  PREPARING
      ↓ 15s
QUALITY_CHECK
      ↓ 10s
OUT_FOR_DELIVERY
      ↓ 25s
  DELIVERED
```

Status updates are **automatic** (simulated via `setTimeout`) and streamed to the client in real-time via SSE.

---

## ✅ Testing Strategy

- **Unit tests** for all business logic in `lib/store.ts`
- **Validation tests** for all API input edge cases
- **Cart context tests** for all state transitions
- **Utility tests** for formatting and status helpers
- **Data integrity tests** for menu item structure

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

> **Note:** The in-memory store resets on each server restart/cold start. For production, replace with a database (PostgreSQL, MongoDB, Redis).

---

## 📝 License

MIT
