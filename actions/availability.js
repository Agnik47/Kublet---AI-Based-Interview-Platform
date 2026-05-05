"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const setAvailability = async ({ startTime, endTime }) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "INTERVIEWER") {
      throw new Error("Only interviewers can set availability");
    }

    // Delete existing availability
    await db.availability.deleteMany({
      where: { interviewerId: dbUser.id },
    });

    // Create new availability
    const availability = await db.availability.create({
      data: {
        interviewerId: dbUser.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "AVAILABLE",
      },
    });

    return { success: true, availability };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to set availability");
  }
};

export const getAvailability = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "INTERVIEWER") {
      throw new Error("Only interviewers can view availability");
    }

    const availability = await db.availability.findFirst({
      where: { interviewerId: dbUser.id },
    });

    return availability || null;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to get availability");
  }
};
