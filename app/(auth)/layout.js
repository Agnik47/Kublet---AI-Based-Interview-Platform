import { GravityStarsBackground } from '@/components/animate-ui/components/backgrounds/gravity-stars';
import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='flex items-center justify-center pt-40 bg-black'>
      <div className='absolute inset-0 z-0'>
        <GravityStarsBackground />
      </div>
      <div className='relative z-10'>
        {children}
      </div>
      </div>
  )
}

export default AuthLayout;