// components/EmployeeCard.tsx
"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
type EmployeeCardProps = {
  id:number
  full_name: string;
  job_position: string;
  work_email: string;
  work_phone: string;
  image: string;
  tags?: string[];
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
}: EmployeeCardProps) {
  const useFallback = isRemoteUrl(image);

  return (
    <Link href={`/employees/${id}`} className="block">
      <div className="flex items-start gap-4 p-4 border rounded-lg shadow-sm bg-white max-w-md cursor-pointer hover:shadow-md transition">
        {/* Profile Image */}
        <div className="relative w-20 h-20 rounded-full flex-shrink-0 group">
          {useFallback ? (
            <img
              src={image}
              alt={full_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Image
              src={image}
              alt={full_name}
              fill
              className="object-cover rounded-full"
            />
          )}

          {/* Hover preview */}
          <div className="absolute top-0 left-full ml-2 w-40 h-40 rounded-lg overflow-hidden border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {useFallback ? (
              <img
                src={image}
                alt={full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image src={image} alt={full_name} fill className="object-cover" />
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-black">{full_name}</h2>
          <p className="text-gray-600 text-sm mb-2">{job_position}</p>

          <div className="flex items-center text-sm text-gray-700 gap-2">
            <Mail size={16} className="text-purple-500" />
            <span>{work_email}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700 gap-2 mt-1">
            <Phone size={16} className="text-purple-500" />
            <span>{work_phone}</span>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full border bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
    );
}
