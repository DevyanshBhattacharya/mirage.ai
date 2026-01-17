import React from 'react'
import { Link } from 'react-router-dom'

const navbar = () => {
  return (
    <div className='flex justify-between items-center px-16 z-11 absolute fixed top-0 w-full dark:text-foreground mt-4'>
      <div className='flex items-center gap-4'>
        <h1 className='text-3xl font-medium font-[Pixelify_Sans] '>mirage.ai</h1>
      </div>
      <nav className='flex gap-16 items-center'>
        <a href="#features" className='text-sm'>Features</a>
        <a href="#pricing" className='text-sm'>Why Us?</a>
        <a href="#contact" className='text-sm'>Contact</a>
      </nav>
      <div className='flex gap-2 items-center'>
      <Link className='flex gap-2 items-center text-sm z-10 text-center font-[Overused_Grotesk] py-2 px-4 rounded-[8px] border-2' to={'/login'}>Log In</Link>
      <Link className='flex gap-2 items-center dark text-sm z-10 text-center font-[Overused_Grotesk] bg-background text-foreground dark:text-background dark:bg-foreground py-2 px-4 rounded-[8px]'to={'/signup'}>Sign Up</Link>
      </div>
      
    </div>
  )
}

export default navbar
