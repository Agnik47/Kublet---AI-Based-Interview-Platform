import React from 'react'

const MainLayout = ({children}) => {
  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-12 overflow-x-hidden'>{children}</div>
  )
}

export default MainLayout