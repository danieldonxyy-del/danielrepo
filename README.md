# KlabatSync
## Smart Campus Activity & Announcement Hub — Universitas Klabat (UNKLAB)

**Tagline:** One Campus. One Schedule. One Connected Community.  
**Primary Timezone:** Asia/Makassar (WITA, UTC+8)  
**Development Approach:** Front-End First, Modular Architecture, Pluggable AI Service Adapters  

---

## 1. Project Overview

**KlabatSync** is an intelligent, centralized campus activity coordination, event discovery, and announcement management hub designed specifically for **Universitas Klabat (UNKLAB)** in Airmadidi, North Sulawesi.

The platform eliminates fragmented campus communication across academic faculties, student organizations (BEM & HMP), student activity units (UKM), dormitory halls (Edelweiss, Jasmine, Crystal), and Pioneer Chapel spiritual ministries.

### The Three Connected Experiences:
1. **Student Experience:** Event discovery with category filtering, personal agenda management, automated schedule conflict detection, eligibility matching, and simulated Digital QR Pass issuance.
2. **Administrator Experience:** Centralized Admin Studio for creating and approving activities, managing dynamic campus organizations, provisioning administrator roles with scoped RBAC, and simulated QR entrance scanning.
3. **Intelligent Experience:** AI Smart Poster Uploader with scanning line animations that extracts event details from posters into structured forms, contextual Event Q&A grounded in verified rules, and a globally persistent floating AI Chatbot.

---

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| **React 19 + TypeScript** | Component-driven front-end framework with strict type safety |
| **Vite 6** | Modern development server and fast production bundler |
| **Tailwind CSS v4** | Modern utility-first styling with dark mode support |
| **Firebase Auth & Firestore** | Google SSO, Email/Password authentication, and cloud event sync |
| **shadcn/ui Principles** | Reusable, accessible UI component foundation |
| **Lucide React** | Consistent iconography |
| **React Router v7** | Single Page Application routing and deep-linking |
| **React Hook Form + Zod** | Schema-validated form handling and poster extraction |
| **Recharts** | Visual activity category metrics and dashboard statistics |
| **qrcode.react** | Digital Event Pass QR code generation |
| **Sonner** | Interactive toast notifications |
| **localStorage** | Client-side demo persistence across sessions |

---

## 3. Architecture & Project Structure

```text
newfpfr/
├── public/
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   └── GlobalChatbotWidget.tsx      # Globally persistent floating AI widget
│   │   ├── attendance/
│   │   │   └── DigitalPassModal.tsx         # Digital Event Pass with unique QR token
│   │   ├── events/
│   │   │   ├── EventCard.tsx                # Complete event card with RSVP & Conflict alerts
│   │   │   ├── EventBadge.tsx               # Color-coded category tags
│   │   │   └── PosterCanvas.tsx             # Resilient CSS/SVG local poster component
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx                # Root shell with Navbar, Sidebar, MobileNav
│   │   │   ├── Navbar.tsx                   # Top navigation with Ctrl+K search & Role switcher
│   │   │   ├── Sidebar.tsx                  # Desktop sidebar with WITA timezone clock
│   │   │   └── MobileNav.tsx                # Bottom navigation bar for mobile devices
│   │   ├── navigation/
│   │   │   ├── GlobalSearch.tsx             # Ctrl+K modal search across events & announcements
│   │   │   ├── RoleSwitcher.tsx             # Simulated Demo Role switcher for presentations
│   │   │   └── ThemeToggle.tsx              # Light / Dark mode toggle
│   │   └── ui/
│   │       └── button.tsx, badge.tsx, card.tsx, dialog.tsx, input.tsx, tabs.tsx
│   ├── context/
│   │   └── AppContext.tsx                  # Authoritative single source of truth & Firebase hook
│   ├── data/
│   │   ├── mockEvents.ts                   # Realistic UNKLAB events (Pioneer Chapel, Hackathons, etc.)
│   │   ├── mockUsers.ts                    # Sample student (Michella Lumengkewas) & Admin team
│   │   ├── mockAnnouncements.ts            # Official rectorate, BAA, and spiritual bulletins
│   │   ├── mockOrganizations.ts            # Extensible organizations (BEM, HMP TI, UKM Choir, etc.)
│   │   └── samplePosters.ts                # 3 UNKLAB sample posters (complete & incomplete info)
│   ├── dialogs/
│   │   ├── PosterUploader.tsx              # Split-screen AI poster uploader with scanning line
│   │   ├── QRScanner.tsx                   # Simulated entrance usher QR scanner
│   │   └── EventDetailsModal.tsx           # Comprehensive event modal with AI Event Q&A
│   ├── pages/
│   │   ├── Overview.tsx                    # Student dashboard with state-derived metrics
│   │   ├── Explore.tsx                     # Event discovery (Grid, Calendar, Timeline views)
│   │   ├── MyAgenda.tsx                    # Personal schedule management & conflict engine
│   │   ├── CalendarPage.tsx                # Daily, Weekly, Monthly, Agenda calendar
│   │   ├── SavedEvents.tsx                 # Bookmarked campus activities
│   │   ├── Announcements.tsx               # University, Academic, and Dormitory circulars
│   │   ├── AIAssistant.tsx                 # Dedicated domain-locked AI chat page
│   │   ├── AdminDashboard.tsx              # Admin studio: approvals, poster upload, attendance
│   │   ├── AdminManagement.tsx             # Super Admin RBAC & administrator invite console
│   │   ├── OrganizationManagement.tsx      # Dynamic organization CRUD & profile management
│   │   └── AuthPage.tsx                    # Student Google SSO / Email login & Admin credentials
│   ├── services/
│   │   ├── firebase.ts                     # Firebase SDK initialization & Auth/Firestore service
│   │   ├── aiService.ts                    # IAIProvider, MockDemoAIAdapter, BackendAPIAdapter
│   │   ├── eventService.ts                 # Event repository with localStorage persistence
│   │   └── attendanceService.ts            # Token generator (KLS-EVT-...) & check-in verification
│   ├── types/
│   │   └── index.ts                        # Centralized TypeScript contract (Part 20 & 30)
│   └── utils/
│       ├── conflictDetection.ts            # Standardized schedule conflict engine (Part 21)
│       ├── eligibility.ts                  # Student faculty/batch/dormitory eligibility engine
│       └── cn.ts                           # Tailwind class merger
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9

### Installation & Run
```bash
# Masuk ke direktori newfpfr
cd newfpfr

# Pasang dependensi
npm ci

# Jalankan server development Vite
npm run dev
```
Buka browser pada `http://localhost:5173`.
   
    types/
       index.ts                        # Centralized TypeScript contract (Part 20 & 30)
   
    utils/
       conflictDetection.ts            # Standardized schedule conflict engine (Part 21)
       eligibility.ts                  # Student faculty/batch/dormitory eligibility engine
       cn.ts                           # Tailwind class merger
```

---

## 4. Production Build

```bash
npm run build
npm run preview
```

The preview server is intended for local verification. Configure and deploy Firebase separately before using production workflows.

## 5. Walkthrough of Signature Features

### 5.1 AI Smart Poster Uploader (Part 8 & 9)
Navigate to **Admin Studio -> AI Poster Uploader** or click the **AI Poster** button in the top navbar.
- **Split-Screen Interface:** Left panel handles image drag-and-drop and scanning line animation; right panel displays the reactive form.
- **Sample UNKLAB Presets:** Under the uploader, click any of the 3 presets:
  1. *FIK AI & Cloud Hackathon:* Complete academic event schema.
  2. *Youth Vespers:* Spiritual activity with 1 Chapel Point.
  3. *Dormitory General Assembly:* Intentionally incomplete schema (missing end time and unspecified dress code) highlighting the AI extraction missing field badge.

### 5.2 Standardized Schedule Conflict Engine (Part 21)
Located in `src/utils/conflictDetection.ts` and shared centrally by Overview, My Agenda, Calendar, and the AI Assistant.
- **Direct Conflict (Red):** Two events overlap on the same date and time.
- **Potential Conflict (Amber):** Less than 30 minutes transition gap between consecutive activities.
- **Available (Green):** Free time buffer of at least 30 minutes.
- **Incomplete Schedule (Grey):** Unconfirmed or missing end time.

### 5.3 Simulated QR Digital Pass & Entrance Scanner (Part 16)
- When a student clicks **RSVP Going** on any event, a unique token (`KLS-EVT-2026-XXXXXX`) is generated.
- Click **Digital Pass** to open the ticket modal with a scannable QR code.
- Open **QR Scanner Demo** from the top right button or Admin Studio to simulate entrance scanning. Entering or clicking the token updates attendance from `not_checked_in` to `checked_in`. Scanning the same token a second time triggers duplicate prevention.

### 5.4 Global KlabatSync AI Chatbot & Strict Domain Lock (Part 27 & 28)
- Click the floating **Ask KlabatSync AI** button at the bottom-right of any page.
- Test asking:
  - *"What's my schedule tomorrow?"* (grounded in your active RSVPs)
  - *"Which events give chapel points?"* (retrieves Pioneer Chapel services)
  - *"Recommend activities for FIK"* (matches your student profile)
- Test out-of-scope requests:
  - *"Write a Python script for a binary search tree"* -> Politely refused under Part 28 campus domain restrictions.

### 5.5 Extensible Organization Management (Part 30.9)
- Open **Organizations** from the sidebar.
- Super Admin can create, edit, or archive new organizations (BEM, HMP, UKM, Dormitory Councils) with custom categories and contact profiles without altering source code.

### 5.6 Presentation Mode & Demo Role Switcher (Part 23 & 30)
- In the top navbar, click the **Role** dropdown to instantly switch between:
  - **Student Mode** (*Michella Lumengkewas*, FIK, Edelweiss Dormitory)
  - **Super Admin** (*Dr. Arthur Sengkey*)
  - **Campus Admin** (*Prof. Danny Rantung*)
  - **ORMAWA Admin** (*Ephraim Roring*, BEM)
  - **Dormitory Admin** (*Head Dean Sarah Rondonuwu*)
  - **Spiritual Admin** (*Pastor Jerry Manoppo*)
  - **Organization Admin** (*Kezia Sompie*, HMP Informatika)
- In Admin Studio, switch to the **Presentation & Reset Mode** tab and click **Restore Default UNKLAB Demo State** to reset all mock records.

---

## 6. Simulation & Security Boundaries

Per Part 30 of the engineering consensus:
- **Demo Mode:** Runs 100% locally in the browser using `localStorage` and `MockDemoAIAdapter`. No external API keys or paid accounts are required.
- **Authentication & RBAC:** Role switching and QR scanning are front-end simulations designed for thesis defense and classroom evaluation.
- **Production Mode Integration:** `BackendAPIAdapter` is provided in `src/services/aiService.ts` for future connection to a secure server-side API (`/api/ai/chat`, `/api/ai/extract-poster`) with Google Gemini credentials stored safely in server environment variables.

---

## 7. License
Universitas Klabat (UNKLAB) — Academic & Demonstration License.
