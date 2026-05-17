import PageHeader, { GoldTitle, SectionHeading, SectionLabel } from '@/components/reusables'
import React from 'react'
import ExploreGrid from './components/ExploreGrid'
import { getInterviewers } from '@/actions/explore'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'

const ExplorePage = async () => {
  const dbUser = await getCurrentUser();
  if (!dbUser) redirect("/");

  if (dbUser.role === "INTERVIEWER") {
    redirect("/dashboard");
  }

  const interviewers = await getInterviewers();
  return (
    <main className='min-h-screen bg-black'>
       {/* Page header */}
      <PageHeader
        label="Explore"
        gray="Find your"
        gold="expert intervi'ewer"
        description="Browse senior engineers from top companies."
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 xl:px-0 py-10">
        <ExploreGrid interviewers={interviewers} />
      </div>
    </main>
  )
}

export default ExplorePage