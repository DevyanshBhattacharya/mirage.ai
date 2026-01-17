import React from 'react'
import mirageailogo3 from '../assets/mirageailogo3.png'
import { useTheme } from '../context/themeProvider.jsx'
import { useEffect } from 'react'
import { Sun } from 'lucide-react'
import { Moon } from 'lucide-react'
import { FaGoogle } from "react-icons/fa";
import { Link } from 'react-router-dom'

const Login = () => {
    const  {theme, toggleTheme} = useTheme();
    const handleChange = () => {
        toggleTheme()
    }
  return (
    <div className='flex flex-col justify-center items-center h-dvh dark:bg-background dark:text-foreground bg-background text-foreground gap-4'>
        <button className="absolute flex gap-2 items-center justify-center font-medium text-md px-4 py-2 border-1 rounded-md right-4 top-4  hover:bg-foreground/15 transition duration-300 hover:cursor-pointer" onClick={handleChange}>
            {(theme === 'dark') ? <Moon/> : <Sun/>} 
        </button>
      <img src={mirageailogo3} alt="Logo" className='object-cover'/>
      <div className='flex flex-col gap-1 items-center justify-center'>
      <h1 className='text-4xl text-center font-[Instrument_Serif]'>Hey, Welcome Back!</h1>
      <p className='text-foreground/65'>First time here? <Link to={'/signup'} className='text-foreground'>Signup for free!</Link></p>
      </div>

      <div className='flex flex-col gap-2 items-center justify-center'>
        <input type="email" placeholder='Your Email' className='bg-background/50 dark:bg-background/50 text-foreground rounded-md px-4 py-2 outline-none border-1 border-foreground/20 w-[350px]'/>
        <input type="password" placeholder='Enter password' className='bg-background/50 dark:bg-background/50 text-foreground rounded-md px-4 py-2 outline-none border-1 border-foreground/20 w-[350px]'/>
        <button className='bg-foreground text-background py-2.5 rounded-lg w-[350px] hover:bg-foreground/75 transition duration-300 hover:cursor-pointer'>Log In</button>
      </div>

        <div className='flex gap-2 items-center justify-center'>
            {/* line */}
            <div className='w-[150px] h-[1px] bg-foreground/20'></div>
            <p className='text-foreground/50'>or</p>
            <div className='w-[150px] h-[1px] bg-foreground/20'></div>
        </div>

        <button className='flex gap-2 items-center justify-center bg-foreground text-background py-2.5 rounded-lg w-[350px] hover:bg-foreground/75 transition duration-300 hover:cursor-pointer'
        onClick={()=>{
          window.location.href = '/home'
        }}
        ><FaGoogle/> Log in with Google</button>

    </div>
  )
}

export default Login
