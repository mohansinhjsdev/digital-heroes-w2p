# Digital Heroes (Level 2) — Custom Web-to-Print Platform

A custom, subscription-free, transactional web-to-print platform engineered for a multi-division print house running six specialized divisions: **Labels & Stickers**, **Race & Event Numbers**, **MTB Boards**, **Stamps**, **Trophies & Awards**, and **Laser-Cut Work**.

Engineered strictly adhering to the **March 2026 Edition (Level 2) PRD**.

---

## 🔑 Test Credentials (For Evaluation)

The application includes dedicated, pre-seeded accounts for both user journeys specified in § 03:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Administrator** | `admin@digitalheroes.co.in` | `Admin@123` | Production pipeline console (`/admin`), file downloads, order stage progression. |
| **Customer** | `customer@demo.com` | `Customer@123` | Configure, in-browser design, proof approval gate, order history, 1-click reorder (`/customer`). |

*(Note: Public visitors can also browse the 6 divisions and use the live instant-price calculator freely without signing in. To create a fresh account, use the **Register** link in the navigation bar).*

---

## 🛠️ Architecture & Technology Stack

### Backend (`/server`)
- **Runtime & Language**: Node.js (v24+) with Strict TypeScript (`strict: true`).
- **Framework**: Express.js with modular routing.
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client`).
- **Validation**: Zod runtime schema validation for `req.body`, `req.query`, and `req.params`.
- **Print Engine**: `pdf-lib` server-side vector PDF generation with calibrated 3mm bleed margin and corner trim ticks.
- **CSV Variable Data Merge**: `papaparse` server-side batch variable interpolation with shrink-to-fit typography for race numbers.
- **Architecture**: Strict 4-File Modular Pattern per feature (`.schema.ts`, `.service.ts`, `.controller.ts`, `.routes.ts`).
- **Async Execution**: Direct clean asynchronous server execution.

### Frontend (`/client`)
- **Tooling**: React with Vite & TypeScript.
- **Styling**: Tailwind CSS with clean, grounded developer layout.
- **Routing**: `react-router-dom`.
- **State Management**: Idiomatic React hooks (`useState`, `useEffect`) and Context API (`AuthContext`).

---

## 📂 Project Structure

```
digital-heros/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma data models (Users, Divisions, Orders, Proofs, ProductionFiles)
│   │   └── seed.ts               # Auto-bootstrap for default divisions & evaluation accounts
│   ├── src/
│   │   ├── config/env.ts         # Environment variables
│   │   ├── middlewares/          # auth, validate (Zod), and error handlers
│   │   ├── utils/                # AppError, response standardizer
│   │   ├── prisma.ts             # Prisma singleton instance
│   │   ├── app.ts                # Express app factory with registered routes
│   │   ├── server.ts             # HTTP server entrypoint
│   │   └── modules/              # Strict 4-file pattern per module
│   │       ├── auth/             # Dedicated Register, Login, JWT session
│   │       ├── products/         # 6 Divisions catalogue & dynamic parameters
│   │       ├── pricing/          # Live calculation & volume tiers (Xero accounting ready)
│   │       ├── designer/         # Canvas state saving & raw artwork uploads
│   │       ├── print-engine/     # Server-side high-res PDF & CSV variable merge engine
│   │       ├── proofs/           # Versioned proofs (v1, v2) & approval gate
│   │       └── orders/           # Order capture, 1-click reorder, Admin pipeline Kanban
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx        # Navigation with real sign-in / sign-out states
    │   │   └── Footer.tsx        # Technical specifications & PRD compliance footer
    │   ├── context/
    │   │   └── AuthContext.tsx   # Real JWT authentication context with auto-refresh
    │   ├── pages/
    │   │   ├── Home.tsx          # Storefront with 6 Division tiles & Live Work gallery
    │   │   ├── ProductConfigure.tsx # Dynamic mm sizing & Live Pricing Calculator
    │   │   ├── Designer.tsx      # In-Browser W2P Canvas (Bleed/Safe zone + CSV merge)
    │   │   ├── ProofReview.tsx   # Proof Inspection & Client Approval Gate
    │   │   ├── CustomerDashboard.tsx # Profile, Orders, 1-Click Reorder & Saved Designs
    │   │   ├── AdminPipeline.tsx # Production Console (Quote -> Completed pipeline & downloads)
    │   │   ├── Login.tsx         # Dedicated Login with 1-click demo autofill
    │   │   └── Register.tsx      # Customer Registration form
    │   ├── services/api.ts       # Type-safe API client
    │   ├── App.tsx               # Main Router
    │   └── main.tsx
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Running Locally

### 1. Start Server
```bash
cd server
npm install
npm run build
npm run dev
# Running on http://localhost:5000
```

### 2. Start Client
```bash
cd client
npm install
npm run build
npm run dev
# Running on http://localhost:5173
```
