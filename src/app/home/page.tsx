"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AppItem {
  name: string;
  icon: string;
  link: string;
}

const apps: AppItem[] = [
  { name: "Project", icon: "/Images/project.png", link: "/project" },
  { name: "Employees", icon: "/Images/employee.png", link: "/homeEmployee" },
  { name: "Time Off", icon: "/Images/timeoff.jpg", link: "/timeoff" },
  { name: "Timesheet", icon: "/Images/timesheet.jpg", link: "/timesheet" }, // ✅ added here
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-purple-100">
      {/* Center container */}
      <div className="grid grid-cols-2 gap-16 p-8">
        {apps.map((app) => (
          <Link
            key={app.name}
            href={app.link}
            className="flex flex-col items-center space-y-3 group cursor-pointer"
          >
            <div className="bg-white shadow-md hover:shadow-lg p-6 rounded-2xl transition duration-300 transform hover:-translate-y-1">
              <Image
                src={app.icon}
                alt={app.name}
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <p className="text-base text-gray-700 font-semibold group-hover:text-purple-700">
              {app.name}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
