import React from 'react'
import { ShineBorder } from './magicui/shine-border'
import { useTheme } from '../context/themeProvider'


const Toggle = () => {
    const { theme, toggleTheme } = useTheme()
    const handleChange = () => {
        toggleTheme()
    }
  return (
    <>
      <div className="relative flex gap-2 items-center text-lg text-center mb-4 py-2 px-4 rounded-[100px] font-[Instrument_Serif] bg-background/50 dark:bg-background/50 dark:text-foreground backdrop-blur-xl">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} borderWidth={2}/>
        See your content through the eyes of AI after using <span className='font-[Pixelify_Sans]'>mirage.ai</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" role="switch" className="sr-only peer" onChange={handleChange}/>
            <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:bg-[#15FF00]"></div>
            <div className="absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform peer-checked:translate-x-4.5"></div>
        </label>
      </div>
    </>
  )
}

export default Toggle
