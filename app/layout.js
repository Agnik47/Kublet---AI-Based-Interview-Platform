import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const metadata = {
  title: "Kublet",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: "#fbbf24", // amber-400
        colorBackground: "#0f0f11",
        colorText: "#e7e5e4", // stone-200
        colorTextSecondary: "#a8a29e", // stone-400
        colorInputBackground: "#141417",
        colorInputText: "#e7e5e4",
        colorWarning: "#fbbf24",
        colorDanger: "#ef4444",
        colorSuccess: "#10b981",
        borderRadius: "0.75rem", // rounded-xl
      },
      elements: {
        card: "bg-[#0f0f11] border border-white/10 shadow-xl",
        pricingTable: "gap-5",
        pricingTableCard: "bg-[#0f0f11] border border-white/10 hover:border-amber-400/10 transition-all rounded-2xl p-10 h-full",
        pricingTableCard__highlighted: "bg-[#141417] border border-amber-400/20",
        pricingTableCardHeader: "pb-4",
        pricingTablePrice: "text-amber-400 font-serif",
        pricingTableButton: "hover:bg-amber-500",
        formButtonPrimary: "bg-amber-400 hover:bg-amber-500 text-black",
        footerActionLink: "text-amber-400 hover:text-amber-300",
      }
    }}>
      <html
        lang="en"
        suppressHydrationWarning
        suppressContentEditableWarning
      >
        <body className={` ${lora.variable} ${dmSans.variable} min-h-full bg-black flex flex-col overflow-x-hidden`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />
            <main className="min-h-screen">

              {children}
            </main>
            <Toaster richColors />
            {/* Footer */}
            <footer className="relative z-10 border-t border-white/7 py-12  mx-auto px-6 flex flex-wrap items-center justify-center text-stone-400">
              Made with 🧠 by Agnik
            </footer>
          </ThemeProvider></body>
      </html>
    </ClerkProvider>
  );
}
