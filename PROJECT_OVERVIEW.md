# Kublet - AI-Powered Mock Interview Platform

## 🌟 Concept Overview
**Kublet** is an AI-powered mock interview platform designed to connect candidates (Interviewees) with industry veterans (Interviewers) for 1:1 peer-to-peer interview sessions. The platform operates on a **credit-based system** where candidates spend credits to schedule sessions, and interviewers earn credits which can be withdrawn as payouts.

The platform distinguishes itself through its **AI integration**, providing live AI question generation for interviewers and comprehensive, AI-analyzed post-interview feedback reports for candidates. It supports end-to-end workflows including slot-based scheduling, integrated HD video calls, and persistent chat.

---

## 🚀 Key Features

### For Interviewees (Candidates)
*   **Browse Experts:** Find interviewers categorized by domains (Frontend, Backend, System Design, DSA, DevOps, AI/ML, etc.).
*   **Slot-based Scheduling:** Book interviews easily by picking from available slots without the back-and-forth negotiation.
*   **Integrated Video Calls:** HD video calls powered by Stream, featuring screen sharing and recording.
*   **AI Feedback Reports:** Receive detailed post-interview analysis powered by AI (Gemini), covering technical skills, communication, problem-solving, strengths, and actionable improvements.
*   **Persistent Chat:** Message interviewers before and after the call to share prep notes, resources, and follow-ups.

### For Interviewers (Experts)
*   **Availability Management:** Easily set availability slots to let candidates book mock sessions.
*   **Custom Credit Pricing:** Set a custom rate (credits per mock interview) based on experience and demand.
*   **AI Question Generator:** Access an AI co-pilot that generates role-specific and level-appropriate questions on-demand during the interview.
*   **Payout System:** Earn credits per completed session and track platform payouts.

### Platform-Wide
*   **Credit/Billing System:** Integrated with Clerk pricing/billing where users can top up credits, and transactions are securely logged.
*   **Role-Based Access Control:** Separation between `UNASSIGNED`, `INTERVIEWEE`, and `INTERVIEWER` experiences right from onboarding.
*   **Robust Security:** Bot protection, rate limiting, and abuse prevention powered by Arcjet on all key API routes.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 16.2.3 (App Router) & React 19
*   **Styling & UI:** Tailwind CSS v4, custom Shadcn UI, Radix UI Primitives, and Base UI Components.
*   **Animations:** Framer Motion (v12) and custom CSS animations.
*   **Database & ORM:** PostgreSQL, connected and managed via Prisma ORM (`@prisma/client` & DB Adapter).
*   **Authentication & Billing:** Clerk (`@clerk/nextjs`).
*   **Security:** Arcjet (`@arcjet/next`).

---

## 📦 Current Packages & Dependencies

### Core / Framework
*   `next` (16.2.3)
*   `react`, `react-dom` (19.2.4)

### UI & Styling
*   `tailwindcss` v4, `@tailwindcss/postcss`
*   `radix-ui`, `shadcn`, `@base-ui-components/react`: Accessible, unstyled primitives for building design systems.
*   `class-variance-authority`, `clsx`, `tailwind-merge`: For robust Tailwind class conditional routing and merging.
*   `lucide-react`: Iconography.
*   `next-themes`: Theme management (dark/light mode).
*   `shiki`: Premium code syntax highlighting (useful for feedback components).

### Animations
*   `motion`: Framer Motion for complex interactive elements.
*   `tw-animate-css`: Tailwind CSS animation utilities.

### Database & Backend
*   `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`: Prisma ORM and the PostgreSQL driver.
*   `@clerk/nextjs`, `@clerk/themes`: Complete Identity and User management.
*   `@arcjet/next`: Application security.
*   `date-fns`: Powerful date and time formatting (for scheduling).
*   `sonner`: Toast notification system.

---

## 📁 Folder Structure

```text
ai_interview/
├── actions/             # Next.js Server Actions containing business logic (explore.js, onboarding.js)
├── app/                 # Next.js App Router Pages
│   ├── (auth)/          # Authentication routes (Sign-in, Sign-up)
│   ├── (main)/          # Core platform routes (Explore, Onboarding, and potentially Dashboard)
│   ├── globals.css      # Core application styling and Tailwind imports
│   ├── layout.js        # Root application layout
│   └── page.jsx         # Landing Page 
├── components/          # Reusable React components
│   ├── animate-ui/      # Advanced animated UI components (code demos, gravity stars, etc.)
│   ├── ui/              # Shadcn UI primitives (badges, buttons, inputs, etc.)
│   └── ...              # Specialized components (Header, PricingSection, RoleRedirect)
├── hooks/               # Custom React hooks for client-side state/lifecycle
├── lib/                 # Core utilities, configuration, and helpers
│   ├── checkUser.js     # User creation/check against DB upon login
│   ├── data.js          # Static marketing/platform configuration data
│   ├── prisma.js        # Global Prisma client instantiation
│   └── utils.js         # Common formatting and merging utility functions
├── prisma/              # Prisma Database definitions
│   ├── migrations/      # Migration history
│   └── schema.prisma    # Core database shape (Models: User, Booking, Availability, Feedback, CreditTransaction, Payout)
├── public/              # Static files (images, icons, etc.)
├── eslint.config.mjs    # ESLint configurations
├── next.config.mjs      # Framework and environment configurations
├── package.json         # NPM dependencies and scripts
└── README.md            # Initial repository instructions
```