# Kublet - AI-Powered Mock Interview Platform

## 🌟 Concept Overview

**Kublet** is an AI-powered mock interview platform designed to connect candidates (Interviewees) with industry veterans (Interviewers) for 1:1 peer-to-peer interview sessions. The platform operates on a **credit-based system** where candidates spend credits to schedule sessions, and interviewers earn credits which can be withdrawn as payouts.

The platform distinguishes itself through its **AI integration**, providing live AI question generation for interviewers using Google's Generative AI and comprehensive, AI-analyzed post-interview feedback reports for candidates. It supports end-to-end workflows including slot-based scheduling, integrated HD video calls with recording capabilities (powered by Stream.io), persistent chat messaging, and professional email communications.

---

## 🚀 Key Features

### For Interviewees (Candidates)

- **Browse Experts:** Find interviewers categorized by domains (Frontend, Backend, System Design, DSA, DevOps, AI/ML, etc.).
- **Slot-based Scheduling:** Book interviews easily by picking from available slots without the back-and-forth negotiation.
- **Integrated Video Calls:** HD video calls powered by Stream, featuring screen sharing and recording.
- **AI Feedback Reports:** Receive detailed post-interview analysis powered by AI (Gemini), covering technical skills, communication, problem-solving, strengths, and actionable improvements.
- **Persistent Chat:** Message interviewers before and after the call to share prep notes, resources, and follow-ups.

### For Interviewers (Experts)

- **Availability Management:** Easily set availability slots to let candidates book mock sessions.
- **Expert Profiles:** Customize your profile with bio, experience level, company, and interview categories.
- **Custom Credit Pricing:** Set a custom rate (credits per mock interview) based on experience and demand.
- **AI Question Generator:** Access an AI co-pilot that generates role-specific and level-appropriate questions on-demand during the interview.
- **Payout System:** Earn credits per completed session with withdrawal capability and platform fee tracking.

### Platform-Wide

- **Credit/Billing System:** Integrated with Clerk for authentication and user management, with transaction logging for all credit operations.
- **Role-Based Access Control:** Separation between `UNASSIGNED`, `INTERVIEWEE`, and `INTERVIEWER` experiences right from onboarding with proper permission boundaries.
- **Robust Security:** Bot protection, rate limiting, and abuse prevention powered by Arcjet on all key API routes.
- **Interview Categories:** Support for 8 categories: Frontend, Backend, Full Stack, DSA, System Design, DevOps, AI/ML, and Mobile.
- **Comprehensive Feedback System:** AI-powered post-interview feedback analyzing technical skills, communication, problem-solving with ratings and recommendations.
- **Call Recording & Analytics:** Integrated video call recording through Stream.io with secure storage of recording URLs.

---

.2.4

- **Styling & UI:** Tailwind CSS v4, custom Shadcn UI, Radix UI Primitives, and Base UI Components.
- **Animations:** Framer Motion (Motion v12.38.0) and custom CSS animations (tw-animate-css).
- **Database & ORM:** PostgreSQL with Prisma ORM v7.7.0 (`@prisma/client` & PostgreSQL adapter).
- **Authentication & User Management:** Clerk (`@clerk/nextjs` v7.2.1).
- **Video & Messaging:** Stream.io SDK (`@stream-io/video-react-sdk`, `stream-chat-react`, `stream-chat`).
- **AI:** Google Generative AI (`@google/generative-ai` v0.24.1) for question generation and feedback analysis.
- **Email:** Resend (`resend` v6.12.3) for transactional emails.
- **Security:** Arcjet (`@arcjet/next` v1.4.0) for bot protection and rate limiting.
- **Code Highlighting:** Shiki v4.0.2 for syntax highlighting in feedback components.
- **Date & Time:** date-fns v4.1.0 for scheduling and time management.
- **Notifications:** Sonner v2.0.7 for toast notifications.
- **Icons:** Lucide React v1.8.0 for iconographynd custom CSS animations.
- **Database & ORM:** PostgreSQL, connected and managed via Prisma ORM (`@prisma/client` & DB Adapter).
- **Authentication & Billing:** Clerk (`@clerk/nextjs`).
- **Security:** Arcjet (`@arcjet/next`).

---

## 📦 Dependencies Overview

### Core / Framework

- `next` (16.2.3) - React framework
- `react`, `react-dom` (19.2.4) - React library

### UI & Styling

- `tailwindcss` v4, `@tailwindcss/postcss` - Utility-first CSS framework
- `radix-ui`, `shadcn`, `@base-ui-components/react` - Accessible UI primitives
- `class-variance-authority`, `clsx`, `tailwind-merge` - Tailwind class management
- `lucide-react` - Icon library
- `next-themes` - Dark/light mode theme management
- `shiki` (v4.0.2) - Code syntax highlighting for feedback

### Animations & Effects

- `motion` (v12.38.0) - Framer Motion for interactive animations
- `tw-animate-css` (v1.4.0) - Tailwind CSS animations

### Database & ORM

- `@prisma/client` (v7.7.0) - Prisma client
- `prisma` (v7.7.0) - Prisma CLI
- `@prisma/adapter-pg` (v7.7.0) - PostgreSQL adapter
- `pg` (v8.20.0) - PostgreSQL driver

### Authentication & Security

- `@clerk/nextjs` (v7.2.1) - Clerk authentication
- `@clerk/themes` (v2.4.57) - Clerk UI themes
- `@arcjet/next` (v1.4.0) - Bot protection and rate limiting

### Video & Messaging

- `@stream-io/video-react-sdk` (v1.36.0) - Stream video SDK for React
- `@stream-io/video-client` (v1.48.0) - Stream video client
- `@stream-io/node-sdk` (v0.7.56) - Stream Node.js SDK
- `stream-chat` (v9.43.0) - Stream Chat library
- `stream-chat-react` (v14.0.1) - Stream Chat React components

### AI & Language

- `@google/generative-ai` (v0.24.1) - Google Gemini AI for question generation and feedback

### Email

- `resend` (v6.12.3) - Email delivery service

### Utilities

- `date-fns` (v4.1.0) - Date/time formatting and manipulation
- `sonner` (v2.0.7) - Toast notifications

### Development

- `eslint` (v9) - Code linting
- `eslint-config-next` (16.2.3) - Next.js ESLint config

│ ├── aiQuestions.js # AI question generation for interviews
│ ├── appointment.js # Appointment management
│ ├── availability.js # Availability slot management
│ ├── booking.js # Booking creation and management
│ ├── call.js # Video call operations
│ ├── dashboard.js # Dashboard data and analytics
│ ├── explore.js # Interview exploration and discovery
│ ├── onboarding.js # User onboarding workflows
│ └── user.js # User profile operations
├── app/ # Next.js App Router Pages
│ ├── (auth)/ # Authentication routes (Sign-in, Sign-up via Clerk)
│ ├── (main)/ # Core platform routes
│ │ ├── appointments/ # Appointment listing and management
│ │ ├── call/ # Video call interface with Stream.io integration
│ │ ├── dashboard/ # User dashboard (role-specific)
│ │ ├── explore/ # Browse and discover interviewers
│ │ ├── interviewers/ # Interviewer profiles and details
│ │ └── onboarding/ # Role selection and profile setup
│ ├── api/ # API routes
│ │ └── webhooks/ # Webhook handlers (Stream.io events, etc.)
│ ├── globals.css # Core application styling and Tailwind imports
│ ├── layout.js # Root application layout with theme provider
│ └── page.jsx # Landing page
├── components/ # Reusable React components
│ ├── animate-ui/ # Advanced animated UI components (code demos, animations, etc.)
│ │ ├── components/ # Custom animated components
│ │ └── primitives/ # Base animated primitives
│ ├── ui/ # Shadcn UI and Base UI components
│ │ ├── avatar.jsx, badge.jsx, button.jsx, card.jsx
│ │ ├── dialog.jsx, input.jsx, textarea.jsx, tabs.jsx, etc.
│ │ └── sonner.jsx # Toast notification component
│ ├── AIQuestionsPanel.jsx # AI question generator panel for interviews
│ ├── AppointmentCard.jsx # Appointment card display
│ ├── CreditButton.jsx # Credit purchase button
│ ├── FeedbackModal.jsx # Feedback display modal
│ ├── Header.jsx # Application header
│ ├── PricingSection.jsx # Pricing information
│ ├── RoleRedirect.jsx # Role-based routing component
│ ├── UpgradeModal.jsx # Upgrade/plan modal
│ └── theme-provider.jsx # Dark/light mode provider
├── hooks/ # Custom React hooks
│ ├── use-controlled-state.jsx # Controlled component state management
│ ├── use-fetch.jsx # Data fetching hook
│ └── use-is-in-view.jsx # Intersection observer hook
├── lib/ # Core utilities, configuration, and helpers
│ ├── arcjet.js # Arcjet security configuration
│ ├── checkUser.js # User creation/verification on login
│ ├── data.js # Static configuration data (categories, pricing, etc.)
│ ├── get-strict-context.jsx # Context utilities
│ ├── helpers.js # Common helper functions
│ ├── mail.js # Email sending (Resend integration)
│ ├── prisma.js # Global Prisma client instantiation
│ ├── utils.js # Utility functions (formatting, merging)
│ └── generated/ # Auto-generated Prisma client
│ └── prisma/ # Prisma client and schema exports
├── prisma/ # Prisma Database definitions
│ ├── schema.prisma # Complete database schema with 6 models
│ ├── seed.js # Database seeding script
│ └── migrations/ # Migration history
├── public/ # Static files (images, icons, JSON data)
│ └── mock-transcript.jsonl # Mock data for testing
├── scripts/ # Utility scripts
│ └── test-webhook.js # Webhook testing script
├── eslint.config.mjs # ESLint configurations
├── next.config.mjs # Next.js framework configurations
├── jsconfig.json # JavaScript configuration
├── postcss.config.mjs # PostCSS configuration for Tailwind
├── components.json # Component library configuration
├── package.json # NPM dependencies and scripts
├── check_booking.js # Booking verification script
├── fetch_all_bookings.js # Fetch all bookings utility
├── test_db.js # Database testing script
├── proxy.js # Proxy configuration
└── README.md # Repository documentation

```

## 📊 Database Models

The application uses **6 Prisma models**:

1. **User** - Core user model with role-based data (credits for interviewees, expertise for interviewers)
2. **Availability** - Interviewer availability slots with status tracking (AVAILABLE, BOOKED, BLOCKED)
3. **Booking** - Interview session bookings with time, credits, and Stream call integration
4. **Feedback** - AI-generated post-interview feedback with technical, communication, and problem-solving analysis
5. **CreditTransaction** - Credit ledger for all transactions (purchases, deductions, earnings, adjustments)
6. **Payout** - Interviewer payout tracking with fee calculation and status management

### Key Enums
- **UserRole**: UNASSIGNED, INTERVIEWEE, INTERVIEWER
- **BookingStatus**: SCHEDULED, COMPLETED, CANCELLED
- **AvailabilityStatus**: AVAILABLE, BOOKED, BLOCKED
- **InterviewCategory**: FRONTEND, BACKEND, FULLSTACK, DSA, SYSTEM_DESIGN, DEVOPS, AI_ML, MOBILE
- **FeedbackRating**: POOR, AVERAGE, GOOD, EXCELLENT
- **TransactionType**: CREDIT_PURCHASE, BOOKING_DEDUCTION, BOOKING_EARNING, ADMIN_ADJUSTMENT
- **PayoutStatus**: PROCESSING, PROCESSED ├── migrations/      # Migration history
│   └── schema.prisma    # Core database shape (Models: User, Booking, Availability, Feedback, CreditTransaction, Payout)
├── public/              # Static files (images, icons, etc.)
├── eslint.config.mjs    # ESLint configurations
├── next.config.mjs      # Framework and environment configurations
├── package.json         # NPM dependencies and scripts
└── README.md            # Initial repository instructions
```
