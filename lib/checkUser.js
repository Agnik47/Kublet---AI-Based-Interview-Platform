import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

const PLAN_CREDITS = {
    pro: 15,
    starter: 5,
    free: 1
}

const shouldAllocateCredits = (dbUser, currentPlan) => {
    //always allocate if plan changed
    if (dbUser.currentPlan !== currentPlan) return true;

    // Alocated if never alocated before
    if (!dbUser.creditsLastAlocatedAt) return true;

    //Alocated if lastCreditAllocationDate is older than 30 days

    const now = new Date();
    const last = new Date(dbUser.creditsLastAlocatedAt);
    const isNewMonth =
        now.getFullYear() > last.getFullYear() || now.getMonth() > last.getMonth();
    return isNewMonth;
};


// getting current Price
const getCurrentPlan = async () => {
    const { has } = await auth();
    if (has({ plan: 'pro' })) return 'pro';
    if (has({ plan: 'starter' }) || has({ plan: 'stater' })) return 'starter';
    return 'free';
}


//check User    
export const checkUser = async () => {
    const user = await currentUser();
    if (!user) return null;
    try {
        const currentPlan = await getCurrentPlan();
        const credits = PLAN_CREDITS[currentPlan];

        //finding clerk userId
        const loggedInUser = await db.user.findUnique({
            where: { clerkUserId: user.id }
        });

        if (loggedInUser) {
            //Now we have to check should we allocate Credit to that user?
            if (shouldAllocateCredits(loggedInUser, currentPlan)) {
                return await db.user.update({
                    where: { clerkUserId: user.id },
                    data: {
                        credits,
                        currentPlan,
                        creditsLastAlocatedAt: new Date()
                    }
                });
            }

            return loggedInUser;
        }

        // Create new User if user not exist
        const name = `${user.firstName} ${user.lastName}`;
        return await db.user.create({
            data: {
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
                credits,
                currentPlan,
                creditsLastAlocatedAt: new Date(),
            },
        })


    }
    catch (error) {
        console.error("checkUser error:", error.message);
        return null;
    }
}