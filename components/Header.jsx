import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { checkUser } from '@/lib/checkUser'
import { CalendarDays, Users } from 'lucide-react'
import CreditButton from './CreditButton'
import RoleRedirect from './RoleRedirect'

const Header = async () => {
  const user = await checkUser();
  return (
    <header className='fixed top-0 left-0 right-0 z-50 px-4 sm:px-10 py-3 border-b border-white/7 backdrop-blur-xl flex justify-between items-center bg-black/60' >
        <Link href="/" className='flex gap-3 items-center justify-between shrink-0'>
        <Image
          src="/logo3.png"
          alt="Logo"
          loading="eager"
          width={100}
          height={100}
          className="Navlogo h-11 w-auto "
        />
        <p className='text-xl font-bold bg-linear-to-r from-amber-400 to-orange-100 bg-clip-text text-transparent'>KUBLET</p>
      </Link>

      {/* Redirection Login */}
      {user && <RoleRedirect role={user.role} />}

      {/* Sign in */}
      <div className='flex items-center gap-3'>
         <Show when="signed-out">
              <SignInButton >
              <Button variant="ghost" size='hero'>Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="gold" size='hero'>Sign Up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">

              {/* Links */}
              {user?.role === "INTERVIEWER" && (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}

               {user?.role === "INTERVIEWEE" && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/explore">
                  <Users size={16} />
                  <span className="hidden md:inline">Explore</span>
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/appointments">
                  <CalendarDays size={16} />
                  <span className="hidden md:inline">My Appointments</span>
                </Link>
              </Button>
            </>
          )}

              {/* Credits */}

              <CreditButton role={user?.role} credits={user?.credits} />
              <UserButton />
            </Show>
      </div>
    </header>
  )
}

export default Header