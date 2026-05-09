import { GoldTitle, GrayTitle } from "@/components/reusables";

export const LOGOS = [
  { src: "/amazon.svg", alt: "Amazon" },
  { src: "/atlassian.svg", alt: "Atlassian" },
  { src: "/google.webp", alt: "Google" },
  { src: "/meta.svg", alt: "Meta" },
  { src: "/microsoft.webp", alt: "Microsoft" },
  { src: "/netflix.png", alt: "Netflix" },
  { src: "/uber.svg", alt: "Uber" },
];

export const AVATARS = [
  { src: "https://randomuser.me/api/portraits/men/32.jpg" },
  { src: "https://randomuser.me/api/portraits/women/44.jpg" },
  { src: "https://randomuser.me/api/portraits/men/76.jpg" },
  { src: "https://randomuser.me/api/portraits/women/68.jpg" },
  { src: "https://randomuser.me/api/portraits/men/12.jpg" },
];

export const AI_TAGS = [
  { label: "Frontend Engineer", active: true },
  { label: "L5 Level", active: true },
  { label: "React Performance", active: false },
  { label: "System Design", active: false },
  { label: "Behavioural", active: true },
  { label: "DSA", active: false },
  { label: "AI/ML", active: false },
  { label: "Mobile", active: false }
];

export const SLOTS = [
  {
    label: "Mon 10:00 AM",
    cls: "border-amber-400/30 text-amber-200 bg-amber-400/5",
  },
  { label: "Mon 2:00 PM", cls: "border-white/7 text-stone-500" },
  {
    label: "Tue 11:00 AM",
    cls: "border-amber-400/30 text-amber-200 bg-amber-400/5",
  },
  {
    label: "Wed 9:00 AM ✓",
    cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  },
  {
    label: "Thu 3:00 PM",
    cls: "border-amber-400/30 text-amber-200 bg-amber-400/5",
  },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    credits: "1 credit / month",
    featured: false,
    planId: null,
    slug: "free",
    features: [
      "1 mock interview session",
      "HD video call via Stream",
      "Persistent chat thread",
    ],  
  },
  {
    name: "Starter",
    price: "$29",
    credits: "5 credits / month",
    featured: true,
    planId: "cplan_3Az9LokzTcywp64E2clEolnnqhB",
    slug: "starter",
    features: [
      "5 mock interview sessions",
      "AI feedback report",
      "HD video call via Stream",
      "Persistent chat thread",
      "Credits roll over monthly",
    ],
  },
  {
    name: "Pro",
    price: "$69",
    credits: "15 credits / month",
    featured: false,
    planId: "cplan_3Az9PNOYND36xNf4JEkpT22w4X2",
    slug: "pro",
    features: [
      "15 mock interview sessions",
      "AI feedback report",
      "HD video call via Stream",
      "Persistent chat thread",
      "Credits roll over monthly",
      "Recording & playback link",
    ],
  },
];

export const ROLES = [
  {
    label: "Interviewee",
    title: <GrayTitle>Land the role you deserve</GrayTitle>,
    desc: "Stop guessing what interviewers want. Practice with people who've been on the other side and know exactly how top companies evaluate candidates.",
    perks: [
      "Browse by category: Frontend, Backend, System Design, PM",
      "Book sessions using monthly credits from your plan",
      "Receive AI-powered feedback after every session",
      "Access session recordings to review your performance",
      "Chat with your interviewer before and after the call",
    ],
  },
  {
    label: "Interviewer",
    title: <GoldTitle>Earn doing what you&apos;re great at</GoldTitle>,
    desc: "Share your knowledge, help engineers grow, and earn meaningful income on your own schedule. Set your slots, and we handle the rest.",
    perks: [
      "Set your own availability and session rates",
      "AI question generator tailored to each candidate's role",
      "Earn credits per session — withdraw any time",
      "Dashboard with credit balance and withdrawal requests",
    ],
  },
];

export const CATEGORIES = [
  { value: null, label: "All" },
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "FULLSTACK", label: "Full Stack" },
  { value: "DSA", label: "DSA" },
  { value: "SYSTEM_DESIGN", label: "System Design" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "AI_ML", label: "AI/ML" },
  { value: "MOBILE", label: "Mobile" },
];

export const CATEGORY_LABEL = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Full Stack",
  DSA: "DSA",
  SYSTEM_DESIGN: "System Design",
  DEVOPS: "DevOps",
  AI_ML: "AI/ML",
  MOBILE: "Mobile",
};

// onboarding
export const YEARS_OPTIONS = [
  { value: 1, label: "1 yr" },
  { value: 2, label: "2 yrs" },
  { value: 3, label: "3 yrs" },
  { value: 5, label: "5 yrs" },
  { value: 7, label: "7 yrs" },
  { value: 10, label: "10+ yrs" },
];

export const ONBOARDING_ROLES = [
  {
    value: "INTERVIEWEE",
    icon: "🎯",
    title: "I want to practice",
    desc: "Browse expert interviewers, book sessions, and get AI-powered feedback to land your dream role.",
  },
  {
    value: "INTERVIEWER",
    icon: "🧑‍💼",
    title: "I want to interview",
    desc: "Share your expertise, earn credits, and help engineers level up.",
  },
];

// Appointment Card Data
export const STATUS_STYLES = {
  SCHEDULED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  COMPLETED: "border-green-500/20 bg-green-500/10 text-green-400",
  CANCELLED: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const RATING_STYLES = {
  POOR: "ml-auto border-red-500/20 bg-red-500/10 text-red-400",
  AVERAGE: "ml-auto border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  GOOD: "ml-auto border-blue-500/20 bg-blue-500/10 text-blue-400",
  EXCELLENT: "ml-auto border-green-500/20 bg-green-500/10 text-green-400",
};

export const RATING_LABEL = {
  POOR: "Poor",
  AVERAGE: "Average",
  GOOD: "Good",
  EXCELLENT: "Excellent",
};

// Feedback Modal
export const RATING_CONFIG = {
  POOR: {
    label: "Poor",
    emoji: "📉",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
    bg: "from-red-500/5",
  },
  AVERAGE: {
    label: "Average",
    emoji: "📊",
    className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    bg: "from-yellow-500/5",
  },
  GOOD: {
    label: "Good",
    emoji: "👍",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    bg: "from-blue-500/5",
  },
  EXCELLENT: {
    label: "Excellent",
    emoji: "🏆",
    className: "border-green-500/20 bg-green-500/10 text-green-400",
    bg: "from-green-500/5",
  },
};

// Booking Page
export const EXPECT_ITEMS = [
  ["🎥", "HD Video Call", "45-minute session with screen sharing built in."],
  [
    "🤖",
    "AI Question Generator",
    "Role-specific questions generated live during the interview.",
  ],
  [
    "💬",
    "Persistent Chat",
    "Message before and after — share notes, resources, follow-ups.",
  ],
  [
    "📊",
    "AI Feedback Report",
    "Post-interview analysis covering technical depth, communication, and more.",
  ],
  [
    "📹",
    "Recording & Playback",
    "A shareable recording link is generated automatically after the call.",
  ],
];
