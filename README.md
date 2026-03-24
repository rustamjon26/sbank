# SmartAsset Management System (SAMS)

Enterprise-ready asset tracking and lifecycle management for banking and financial institutions.

## 🚀 Key Features

- **Polymorphic Ownership**: Assign assets to Employees, Departments, or Branches using refined join logic.
- **Strict Lifecycle Management**: Built-in state machine prevents invalid asset transitions (e.g., assigning a lost asset).
- **Secure QR Auditing**: Public-facing, secure QR views (`/qr/:id`) provide masked asset data for physical audits without exposing backend IDs.
- **Risk Intelligence**: Centralized analytics engine (`src/lib/analytics.ts`) calculating health scores and risk signals.
- **AI Audit Summaries**: Deterministic, high-quality condition reports generated for every asset.

## 📁 Project Structure

```
├── src
│   ├── components # Professional UI components (Radix + Tailwind)
│   ├── db         # Unified Supabase API and schema definitions
│   ├── lib        # Core logic: analytics.ts, lifecycle.ts, utils.ts
│   ├── pages      # Main views (Dashboard, Assets, Audit, Employees)
│   ├── types      # Centralized TypeScript definitions
│   └── App.tsx    # Application entry and routing
├── supabase       # Migrations and schema setup
└── public         # Static branding assets
```

## 🛠 Tech Stack

- **Framework**: React 18 + Vite (Neutral config)
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Vanilla CSS + Tailwind
- **Icons**: Lucide React

## 🚦 Getting Started

1.  **Clone & Install**: `npm install`
2.  **Environment**: Copy `.env.example` to `.env` and fill Supabase keys.
3.  **Database**: Run migrations in `supabase/migrations`.
4.  **Launch**: `npm run dev`

---

_Developed for professional financial asset management._
