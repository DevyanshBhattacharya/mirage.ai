// import './App.css'
import ImageTrailDemo from '../Components/imageTrail.jsx'
import Navbar from '../Components/navbar.jsx'
import {ThemeProvider, useTheme} from '../context/themeProvider.jsx'
import { useEffect } from 'react'
import React from 'react'
import {FlickeringGrid} from '../Components/magicui/flickering-grid.jsx'

function Landing() {
  const { theme } = useTheme();
  // useEffect(() => {
  //   document.documentElement.classList.remove('light', 'dark');
  //   document.documentElement.classList.add(theme);
  // }, [theme]);
  const isDarkMode = theme === "dark";

  return (
    <>
      <div className="absolute h-dvh overflow-hidden rounded-lg w-dvw top-0 left-0 z-0">
        <FlickeringGrid
          className="relative inset-0 z-0 left-0 top-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
          squareSize={20}
          gridGap={6}
          color={ isDarkMode ? "#00ff11" : "#898989"}
          maxOpacity={0.2}
          flickerChance={0.1}
        />
      </div>
      <div className="dark:bg-foreground dark:text-muted bg-background text-foreground h-screen w-screen overflow-hidden">
        <Navbar/>
        <div className='ovrerflow-hidden'>
          <ImageTrailDemo/>
        </div>
      </div>
        
    </>
  );
}

export default Landing
