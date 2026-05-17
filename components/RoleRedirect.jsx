"use client";
import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const RoleRedirect = ({ role }) => {

    const pathname = usePathname();
    const router = useRouter()
    const INTERVIEWER_RESTRICTED = ["/appointments", "/explore"];
    const INTERVIEWEE_RESTRICTED = ["/dashboard"];

    useEffect(() => {
        if (role === "UNASSIGNED" && pathname !== "/onboarding")
            router.replace("/onboarding");
        // Already onboarded users shouldn't be on /onboarding
        if (role === "INTERVIEWER" && pathname.startsWith("/onboarding"))
            router.replace("/dashboard");
        if (role === "INTERVIEWEE" && pathname.startsWith("/onboarding"))
            router.replace("/explore");
        if (
            role === "INTERVIEWER" &&
            INTERVIEWER_RESTRICTED.some((p) => pathname.startsWith(p))
        )
            router.replace("/dashboard");
        if (
            role === "INTERVIEWEE" &&
            INTERVIEWEE_RESTRICTED.some((p) => pathname.startsWith(p))
        )
            router.replace("/appointments");

    }, [role, pathname, router])
    return null;
}

export default RoleRedirect;