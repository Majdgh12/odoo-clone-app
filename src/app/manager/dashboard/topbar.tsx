// src/components/TopBar.tsx
import { FC } from "react";
import {ShieldUser, Bell, Search, User } from "lucide-react";

 interface TopBarProps {
        className?: string;
      }

const TopBar: FC <TopBarProps>= ({className}) => {
   
  return (
    <header className=" w-full bg-white px-6 py-3 flex items-center justify-between border-b border-gray-300 fixed top-0 z-20">
      {/* Left: Logo / Title */}
      <div className="flex items-center gap-2">
        <ShieldUser className="w-5 h-5 text-[#65435c]"/>
        <span className="text-xl font-bold ">Manager</span>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          {/* Notification Badge */}
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Icon */}
        <div className="flex items-center gap-2 p-2 rounded-lg ">
          <User className="h-5 w-5 text-gray-600" />
     <button className="bg-[#65435c] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#55394e] select-none"
            >
              Manager
            </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
