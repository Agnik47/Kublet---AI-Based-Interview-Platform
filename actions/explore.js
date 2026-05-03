'use server'

import { db } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server";

export const getInterviewers = async () => {

    const user = await currentUser(); 
    
    try {
        const interviewers = await db.user.findMany({
            where: {role: "INTERVIEWER",
                ...(user && {clerkUserId: {not: user.id}})
            },  
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                title: true,
                yearExp: true,
                categories: true,
                imageUrl: true,
                creditRate: true,
                availabilities: {
                    where: { status: "AVAILABLE"},
                    select: {
                        startTime: true,
                        endTime: true,
                    },
                    take: 1,
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return interviewers;
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch interviewers")
    }
}