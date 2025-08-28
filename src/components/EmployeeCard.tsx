"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

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

  return (
    <Link href={`/employees/${id}`} className="block w-full h-full">
      <div className="w-full h-full flex items-start gap-4 p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition">
        {/* Profile Image */}
        <div className="relative w-24 h-24 rounded-full flex-shrink-0 group">
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

        {/* Content Section */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {/* Top Section - Name, Job, Contact */}
          <div className="mb-2">
            {/* Name and Status */}
            <div className="mb-1">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                {full_name}
                <span
                  className={`w-3 h-3 rounded-full ${
                    status === "online" ? "bg-green-400" : "bg-yellow-400"
                  }`}
                  title={status}
                />
              </h2>
              <p className="text-gray-600 text-sm">{job_position}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center text-sm text-gray-700 gap-2">
                <Mail size={16} className="text-purple-500 flex-shrink-0" />
                <span className="truncate">{work_email}</span>
              </div>

              <div className="flex items-center text-sm text-gray-700 gap-2">
                <Phone size={16} className="text-purple-500 flex-shrink-0" />
                <span className="truncate">{work_phone}</span>
              </div>
            </div>
          </div>

          {/* Tags Section - Allow multiple rows */}
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-wrap gap-1 h-full content-start">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full border bg-gray-100 text-gray-700 whitespace-nowrap h-fit"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}