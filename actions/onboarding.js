"use server"

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const completeOnebording = async (data) => {
    //1st we will check user is logged in or not,clerk prvide it

    const user = await currentUser();

    if(!user) {
       throw new Error("Unauthorized")
    }
    
    //2nd we will destructure the data cominmg from User model?
    const { role, bio, title, yearExp, yearsExp, categories } = data;
    const normalizedYearExp = Number(yearExp ?? yearsExp);

    if(!role || !["INTERVIEWEE", "INTERVIEWER"].includes(role)) {
        throw new Error("Invalid role")
    }

    //3rd we will validate the data based on the role
    if(role === "INTERVIEWER") {
        if(!bio || !title || !normalizedYearExp || !Array.isArray(categories) || categories.length === 0) {
            throw new Error("Missing required fields for interviewer")
        }
    }

    try {
        await db.user.update({
            where: {
                clerkUserId: user.id
            },
            data: {
                role,
                ...(role === "INTERVIEWER" && { //if role is interviewer then only update these fields
                    bio,
                    title,
                    yearExp: normalizedYearExp,
                    categories,
                })
            }
        });

        return { success: true }
    } catch (error) {
        console.log(error)
        throw new Error("Failed to complete onboarding")
    }
}   
