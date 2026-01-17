import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  HomeIcon,
  Shield,
  PaintRoller,
  Puzzle,
  TestTube2,
  Sparkles,
  Settings,
  Menu,
  SquareChevronLeft,
  SquareChevronRight
} from "lucide-react";
import { IoExtensionPuzzleSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/themeProvider.jsx";
import { Sun } from "lucide-react";
import { Moon } from "lucide-react";

const SidebarLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleChange = () => {
    toggleTheme();
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const currUrl = useLocation().pathname.split("/")[1];
  return (
    <div className="bg-background dark:bg-background dark:text-foreground text-foreground h-screen w-screen">
      
      <div className="flex flex-row h-screen w-screen z-10 absolute">
        <button
          className="absolute flex gap-2 items-center justify-center font-medium text-md px-4 py-2 border-1 rounded-md right-4 top-4  hover:bg-foreground/15 transition duration-300 hover:cursor-pointer"
          onClick={handleChange}
        >
          {theme === "dark" ? <Moon /> : <Sun />}
        </button>
        
        {/* Sidebar */}
        <div className={`${isCollapsed ? "w-[80px]" : "w-1/5"} dark:bg-[#1A1A1A] bg-[#EAEAEA] text-foreground m-2 rounded-2xl flex flex-col gap-4 items-center justify-between p-4 transition-all duration-300`}>
          <div className="flex flex-col gap-4 justify-center w-full">
            {/* Logo and Header */}
            <div className="flex flex-col gap-4 justify-center w-full">
              {!isCollapsed && <div className="flex justify-between items-center"><h1 className="text-2xl font-[Pixelify_Sans]">mirage.ai</h1> <button
              onClick={toggleSidebar}
              className="flex gap-2 items-center justify-center w-fit text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              { <SquareChevronLeft size={20} />}
            </button></div>}
              {!isCollapsed && <div className="w-full h-[1px] bg-foreground/15"></div>}
            </div>

            {/* Collapse Toggle */}
            {isCollapsed && <button
              onClick={toggleSidebar}
              className="flex gap-2 items-center justify-center w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <SquareChevronRight size={20} />
            </button>}

            {/* Navigation Links */}
            <div className="flex flex-col gap-0 justify-center w-full">
              <Link
                className={`flex gap-2 items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2 ${
                  currUrl == "home" ? "bg-foreground/5" : ""
                }`}
                to={"/home"}
                title="Home"
              >
                <HomeIcon /> {!isCollapsed && "Home"}
              </Link>
              <Link
                className={`flex gap-2 items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2 ${
                  currUrl == "facecloak" ? "bg-foreground/5" : ""
                }`}
                to={"/facecloak"}
                title="Cloak Personal Images"
              >
                <Shield /> {!isCollapsed && "Cloak Personal Images"}
              </Link>
              <Link
                className={`flex gap-2 items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2 ${
                  currUrl == "artcloak" ? "bg-foreground/5" : ""
                }`}
                to={"/artcloak"}
                title="Cloak Your Art"
              >
                <PaintRoller /> {!isCollapsed && "Cloak Your Art"}
              </Link>
              <Link
                className={`flex gap-2 items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2 ${
                  currUrl == "extension" ? "bg-foreground/5" : ""
                }`}
                to={"/extension"}
                title="Chrome Extension"
              >
                <IoExtensionPuzzleSharp /> {!isCollapsed && "Chrome Extension"}
              </Link>
              <Link
                className={`flex gap-2 items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2 ${
                  currUrl == "playground" ? "bg-foreground/5" : ""
                }`}
                to={"/playground"}
                title="Playground"
              >
                <TestTube2 /> {!isCollapsed && "Playground"}
              </Link>
            </div>

            {/* History Section */}
            {/* {!isCollapsed && (
              <div className="flex flex-col gap-0 justify-center w-full">
                <p className="text-md text-foreground/50 mx-2">History</p>
                <Link
                  className={`text-foreground/50 flex gap-2 items-center justify-start w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2`}
                  title="New Chat"
                >
                  <Sparkles /> New Chat
                </Link>
                <Link
                  className={`text-foreground/50 flex gap-2 items-center justify-start w-full text-lg hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2`}
                  title="Personal Image Cloaking"
                >
                  <Sparkles /> Personal Image Cloaking - ...
                </Link>
              </div>
            )} */}
          </div>

          {/* Settings */}
          <div className={`flex gap-2 ${isCollapsed ? "justify-center" : ""} w-full text-foreground/50 hover:text-foreground hover:cursor-pointer hover:bg-foreground/5 transition duration-300 rounded-lg px-3 py-2`} title="Settings">
            <Settings /> {!isCollapsed && "Settings"}
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isCollapsed ? "w-[calc(100%-80px)]" : "w-3/4"} h-dvh bg-background dark:bg-background dark:text-foreground text-foreground overflow-y-auto transition-all duration-300`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
