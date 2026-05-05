"use server";

import { checkRateLimit, createRateLimiter } from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { StreamClient } from "@stream-io/node-sdk";

// *5 booking attempts per hour — generous enough for real users,
// !tight enough to block automated abuse
const bookingLimiter = createRateLimiter({
  refillRate: 2,
  interval: "1h",
  capacity: 5,
});

//! Get Interviewer Profile
export const getInterviewerProfile = async (interviewerId) => {
  try {
    const interviewer = await db.user.findFirst({
      where: {
        id: interviewerId,
        role: "INTERVIEWER",
      },
      select: {
        id: true,
        name: true,
        bio: true,
        imageUrl: true,
        title: true,
        company: true,
        yearExp: true,
        categories: true,
        creditRate: true,

        availabilities: {
          where: { status: "AVAILABLE" },
          select: {
            startTime: true,
            endTime: true,
          },
          take: 1,
        },

        bookingsAsInterviewer: {
          where: { status: "SCHEDULED" },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return interviewer ?? null;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch interviewer profile");
  }
};

// ============================
// Book Slot
// ============================
export const bookSlot = async ({ interviewerId, startTime, endTime }) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    //! Arcjet Rate Limiter
    const req = await request();
    const rateLimitError = await checkRateLimit(bookingLimiter, req, user.id);
    if (rateLimitError) {
      throw new Error(rateLimitError);
    }

    // Fetch both users in parallel
    const [dbUser, interviewer] = await Promise.all([
      db.user.findUnique({
        where: { clerkUserId: user.id },
      }),
      db.user.findUnique({
        where: { id: interviewerId },
      }),
    ]);

    // Validation
    if (!dbUser || dbUser.role !== "INTERVIEWEE") {
      throw new Error("Only Interviewee can book a slot");
    }

    if (!interviewer || interviewer.role !== "INTERVIEWER") {
      throw new Error("Interviewer not found");
    }

    // Credit check
    const creditsRequired = interviewer.creditRate ?? 1;

    if (dbUser.credits < creditsRequired) {
      throw new Error("Insufficient credits");
    }

    // Conflict check
    const conflict = await db.booking.findFirst({
      where: {
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflict) {
      throw new Error("Slot already booked");
    }

    // ============================
    // Stream Call Setup
    // ============================
    let streamCallId;

    try {
      const streamClient = new StreamClient(
        process.env.NEXT_PUBLIC_STREAM_API_KEY,
        process.env.STREAM_SECRET_KEY,
      );

      await streamClient.upsertUsers([
        {
          id: dbUser.clerkUserId,
          name: dbUser.name ?? "Interviewee",
          image: dbUser.imageUrl ?? undefined,
          role: "user",
        },
        {
          id: interviewer.clerkUserId,
          name: interviewer.name ?? "Interviewer",
          image: interviewer.imageUrl ?? undefined,
          role: "user",
        },
      ]);

      // Generate call ID
      streamCallId = `mock_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const call = streamClient.video.call("default", streamCallId);

      await call.getOrCreate({
        data: {
          created_by_id: dbUser.clerkUserId,
          members: [
            { user_id: dbUser.clerkUserId, role: "host" },
            { user_id: interviewer.clerkUserId, role: "host" },
          ],
          settings_override: {
            recording: {
              mode: "available",
              quality: "1080p",
            },
            screensharing: {
              enabled: true,
            },
            transcription: {
              mode: "auto-on",
            },
          },
        },
      });
    } catch (err) {
      console.error("Stream call creation failed:", err);
      throw new Error("Failed to create video call. Please try again.");
    }

    // ============================
    //! Booking Transaction
    // ============================
    try {
      const booking = await db.$transaction(async (tx) => {
        //?why we use $transation baki jaga to db.something likhete hai
        const newBooking = await tx.booking.create({
          data: {
            intervieweeId: dbUser.id,
            interviewerId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: "SCHEDULED",
            creditsCharged: creditsRequired,
            streamCallId,
          },
        });

        // Deduct credits
        await tx.creditTransaction.create({
          data: {
            userId: dbUser.id,
            amount: -creditsRequired,
            type: "BOOKING_DEDUCTION",
            bookingId: newBooking.id,
          },
        });

        await tx.user.update({
          where: { id: dbUser.id },
          data: {
            credits: { decrement: creditsRequired },
          },
        });

        // Add credits to interviewer
        await tx.user.update({
          where: { id: interviewerId },
          data: {
            creditBalance: { increment: creditsRequired },
          },
        });

        return newBooking;
      });

      // Revalidation
      revalidatePath(`/interviewers/${interviewerId}`);
      revalidatePath("/dashboard");

      return booking;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to book slot");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
