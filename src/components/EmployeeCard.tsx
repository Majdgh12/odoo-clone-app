"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type EmployeeCardProps = {
  id: number;
  full_name: string;
  job_position: string;
  work_email: string;
  work_phone: string;
  image: string;
  tags?: string[];
  status: "online" | "offline";
};

function isRemoteUrl(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EmployeeCard({
  id,
  full_name,
  job_position,
  work_email,
  work_phone,
  image,
  tags = [],
  status,
}: EmployeeCardProps) {
  const useFallback = isRemoteUrl(image);
  const [isImageHovered, setIsImageHovered] = useState(false);

  return (
    <Link href={`/employees/${id}`} className="block w-full h-full">
      <div className="relative w-full h-auto min-h-fit flex items-start gap-2 p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition z-0">

        {/* Profile Image */}
        <div className="relative w-20 h-20 flex-shrink-0 overflow-visible z-0">
          <div
            className="relative w-full h-full rounded-lg "
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            {useFallback ? (
              <img
                src={image}
                alt={full_name}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
              />
            ) : (
              <Image
                src={image}
                alt={full_name}
                fill
                className="object-cover rounded-lg cursor-pointer"
              />
            )}
          </div>

          {/* Hover preview above the image - SQUARE */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4
              w-32 h-32 rounded-lg border shadow-lg bg-white 
              transition-opacity duration-200 z-10 pointer-events-none 
              ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}>

            {useFallback ? (
              <img
                src={image}
                alt={full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={image}
                alt={full_name}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">

          {/* Name and Status */}
          <div>
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              {full_name}
              <span
                className={`w-2.5 h-2.5 rounded-full ${status === "online" ? "bg-green-400" : "bg-yellow-400"}`}
                title={status}
              />
            </h2>
            <p className="text-gray-700 text-sm leading-tight">{job_position}</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-800 gap-2">
              <Mail size={14} className="text-purple-500 flex-shrink-0" />
              <span className="truncate">{work_email}</span>
            </div>

            <div className="flex items-center text-sm text-gray-800 gap-2">
              <Phone size={14} className="text-purple-500 flex-shrink-0" />
              <span className="truncate">{work_phone}</span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1 min-h-[1.5rem] ">
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs rounded-full border bg-gray-100 text-gray-700 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))
            ) : (
              // Empty space placeholder
              <div className="w-full h-0.5" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}