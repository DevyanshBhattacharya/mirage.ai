import React from 'react'
import wave from '../assets/wave.png'
import card1bg from '../assets/card1bg.png'
import card2bg from '../assets/card2bg.png'
import card3bg from '../assets/card3bg.png'
import card4bg from '../assets/card4bg.png'
import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
    const handleSubmit = () => {
        alert('Submit button clicked!')
    }
  return (
    <div className='flex flex-col justify-center items-center h-dvh  dark:text-foreground text-foreground gap-4 w-full'>
      <div className='w-[50%] bg-background/50 dark:bg-background/50 text-foreground rounded-2xl flex flex-col gap-16 items-center justify-center'>
        <div div className='flex flex-col gap-1 justify-center w-full'>
            <h1 className='text-4xl font-[Instrument_Serif] flex gap-2'>Hi, Kartik Bindra! <img src={wave} className='w-[35px] h-[35px]'/></h1>
            <p className='text-foreground/65 text-2xl'>How can I help you today?</p>
        </div>
        {/* bento grid of cards */}
        <div className='flex flex-col gap-4 justify-center items-center w-full'>
            <div className='flex flex-row gap-4 justify-center items-center w-full'>
                <Link className='bg-foreground/5 dark:bg-foreground/5 text-foreground rounded-xl flex flex-col gap-1 justify-end p-4 hover:bg-foreground/20 transition duration-300 hover:cursor-pointer h-[160px] border-1 w-[350px] bg-top-right hover:border-1 hover:border-foreground/25 hover:scale-103'
                style={{backgroundImage: `url(${card1bg})`, backgroundRepeat: 'no-repeat'}}
                to={'/facecloak'}
                >
                    <h1 className='text-xl'>Protect Personal Images</h1>
                    <p className='text-foreground/50 text-sm'>Cloak your personal media to preotect it from AI models training.</p>
                </Link>
                <Link className='bg-foreground/5 dark:bg-foreground/5 text-foreground rounded-xl flex flex-col gap-1 justify-end p-4 hover:bg-foreground/20 transition duration-300 hover:cursor-pointer h-[160px] border-1 w-[350px] bg-top-right hover:border-1 hover:border-foreground/25 hover:scale-103'
                style={{backgroundImage: `url(${card2bg})`, backgroundRepeat: 'no-repeat'}}
                to={'/artcloak'}>
                    <h1 className='text-xl'>Protect Your Art</h1>
                    <p className='text-foreground/50 text-sm'>Cloak your digital & real-life art so that AI can’t be trained on it.</p>
                </Link>
            </div>
            <div className='flex flex-row gap-4 justify-center items-center w-full'>
                <Link className='bg-foreground/5 dark:bg-foreground/5 text-foreground rounded-xl flex flex-col gap-1 justify-end p-4 hover:bg-foreground/20 transition duration-300 hover:cursor-pointer h-[160px] border-1 w-[500px] bg-top hover:border-1 hover:border-foreground/25 hover:scale-103'
                style={{backgroundImage: `url(${card3bg})`, backgroundRepeat: 'no-repeat'}}
                to={'/extension'}>
                    <h1 className='text-xl'>Download Chrome Extension</h1>
                    <p className='text-foreground/50 text-sm'>Need to cloak every image you upload to the internet? Download our browser extension now!</p>
                </Link>
                <Link className='bg-foreground/5 dark:bg-foreground/5 text-foreground rounded-xl flex flex-col gap-1 justify-end p-4 hover:bg-foreground/20 transition duration-300 hover:cursor-pointer h-[160px] border-1 w-[350px] bg-top-right hover:border-1 hover:border-foreground/25 hover:scale-103'
                style={{backgroundImage: `url(${card4bg})`, backgroundRepeat: 'no-repeat'}}
                to={'/playground'}>
                    <h1 className='text-xl'>Playground</h1>
                    <p className='text-foreground/50 text-sm'>Explore how AI perceives your cloaked images in real-time.</p>
                </Link>
            </div>
        </div>
        <div className='flex flex-row gap-1 justify-between items-center w-full px-4 py-3 rounded-full bg-foreground/10'>
            <input className='text-lg text-foreground w-full decoration-none border-none focus:ring-0 focus:ring-offset-0 focus:outline-none' placeholder='Ask me anything ... '></input>
            <div className='bg-foreground rounded-full p-1 text-background hover:cursor-pointer' onClick={handleSubmit}><ArrowUp/></div>
        </div>
      </div>
    </div>
  )
}

export default Home
