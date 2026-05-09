import { getIntervieweeAppointment } from "@/actions/appointment";
import {
  getAvailability,
  getInterviewerStats,
  getWithdrawalHistory,
} from "@/actions/dashboard";
import { getCurrentUser } from "@/actions/user";
import PageHeader from "@/components/reusables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@clerk/nextjs/server";
import { ClipboardList, Clock, Wallet } from "lucide-react";
import React from "react";
import AppointmentsSection from "./_components/AppointmentsSection";
import AvailabilitySection from "./_components/AvailabilitySection";
import EarningsSection from "./_components/EarningsSection";

const AdminDashBoadPage = async () => {
  const user = await currentUser();

  const dbUser = await getCurrentUser();

  const [availability, appointments, stats, withdrawalHistory] =
    await Promise.all([
      getAvailability(),
      getIntervieweeAppointment(),
      getInterviewerStats(),
      getWithdrawalHistory(),
    ]);

  return <main className="min-h-screen bg-black">

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
          <div>
            <p className="text-xs text-stone-600">Credit balance</p>
            <p className="font-serif text-3xl leading-none bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent text-right">
              {stats?.creditBalance ?? 0}
            </p>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-8 py-10">    


        <Tabs defaultValue="earnings">
          <TabsList className="bg-[#0f0f11] border border-white/10 mb-8 w-full">
            <TabsTrigger value="earnings" className="p-5">
              <Wallet size={16} className="text-amber-400" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="appointments" className="p-5">
              <ClipboardList size={18} className="text-amber-400" />{" "}
              Appointments
            </TabsTrigger>
            <TabsTrigger value="availability" className="p-5">
              <Clock size={18} className="text-amber-400" /> Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentsSection appointments={appointments} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilitySection initial={availability} />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsSection stats={stats} history={withdrawalHistory} />
          </TabsContent>
        </Tabs>
      </div>

  </main>;
};

export default AdminDashBoadPage;
