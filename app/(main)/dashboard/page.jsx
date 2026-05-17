import { getInterviewerAppointments } from "@/actions/appointment";
import {
  getAvailability,
  getInterviewerStats,
  getWithdrawalHistory,
} from "@/actions/dashboard";
import { getCurrentUser } from "@/actions/user";
import PageHeader from "@/components/reusables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@clerk/nextjs/server";
import { ClipboardList, Clock, Wallet, Settings } from "lucide-react";
import React from "react";
import AppointmentsSection from "./_components/AppointmentsSection";
import AvailabilitySection from "./_components/AvailabilitySection";
import EarningsSection from "./_components/EarningsSection";
import SettingsSection from "./_components/SettingsSection";
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars";

const AdminDashBoadPage = async () => {
  const user = await currentUser();

  const dbUser = await getCurrentUser();

  const [availability, appointments, stats, withdrawalHistory] =
    await Promise.all([
      getAvailability(),
      getInterviewerAppointments(),
      getInterviewerStats(),
      getWithdrawalHistory(),
    ]);

  return (
    <main className="min-h-screen bg-black">
      <PageHeader
        label="Interviewer dashboard"
        gray="Welcome back,"
        gold={dbUser.name?.split(" ")[0] ?? "Interviewer"}
        description={
          dbUser.title && dbUser.company
            ? `${dbUser.title} · ${dbUser.company}`
            : undefined
        }
        right={
          <div className="text-left sm:text-right">
            <p className="text-xs text-stone-600">Credit balance</p>
            <p className="font-serif text-3xl leading-none bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent mt-1">
              {stats?.creditBalance ?? 0}
            </p>
          </div>
        }
      />

      <div className="absolute top-0 w-full min-h-screen pointer-events-none">
        <GravityStarsBackground
          starsInteraction={false}
          mouseGravity="repel"
          starsOpacity={0.25}
          glowAnimation="spring"
         />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <Tabs defaultValue="earnings">
          <TabsList className="grid grid-cols-2 md:flex md:flex-row bg-[#0f0f11] border border-white/10 mb-8 w-full h-auto p-1 gap-1">
            <TabsTrigger value="availability" className="py-3 px-2 md:p-5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <Clock size={16} className="text-amber-400 shrink-0" /> <span className="truncate">Availability</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="py-3 px-2 md:p-5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <ClipboardList size={16} className="text-amber-400 shrink-0" />{" "}
              <span className="truncate">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="py-3 px-2 md:p-5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <Wallet size={14} className="text-amber-400 shrink-0" /> <span className="truncate">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 px-2 md:p-5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <Settings size={16} className="text-amber-400 shrink-0" /> <span className="truncate">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentsSection appointments={appointments} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsSection initial={dbUser} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilitySection initial={availability} />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsSection stats={stats} history={withdrawalHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminDashBoadPage;
