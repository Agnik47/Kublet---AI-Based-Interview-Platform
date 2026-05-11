"use server";

import { db } from "@/lib/prisma";
import { categories } from "@arcjet/next";
import { currentUser } from "@clerk/nextjs/server";

export const getIntervieweeAppointment = async () => {
  const user = await currentUser();

  if (!user) return [];

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) return [];

  return db.booking.findMany({
    where: { intervieweeId: dbUser.id },
    include: {
      interviewer: {
        select: {
          name: true,
          imageUrl: true,
          email: true,
          title: true,
          company: true,
          categories: true,
        },
      },
      feedback: true,
    },
    orderBy: { startTime: "desc" },
  });
};

export const getInterviewerAppointments = async () => {
  const user = await currentUser();

  if (!user) return [];

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) return [];

  return db.booking.findMany({
    where: { interviewerId: dbUser.id },
    include: {
      interviewer: {
        select: {
          name: true,
          imageUrl: true,
          email: true,
          title: true,
          company: true,
          categories: true,
        },
      },
      interviewee: {
        select: {
          name: true,
          imageUrl: true,
          email: true,
          title: true,
          company: true,
          categories: true,
        },
      },
      feedback: true,
    },
    orderBy: { startTime: "desc" },
  });
};
