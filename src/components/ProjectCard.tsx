"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  status?: string;
  priority?: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const router=useRouter();

  const handleClick=()=>{
    router.push(`/project/${project._id}`);
  }
  return (
    // <Link href={`/projects/${project._id}`} className="block w-full h-full">
      <div
        onClick={handleClick}
        className={`relative w-full h-auto min-h-fit flex flex-col gap-2 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer ${
          hovered ? "ring-1 ring-purple-300" : ""
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Project Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-black truncate">
              {project.name}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-2">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Status dot */}
          <span
            className={`w-2.5 h-2.5 rounded-full mt-1 ${
              project.status === "active"
                ? "bg-green-400"
                : project.status === "on-hold"
                ? "bg-yellow-400"
                : "bg-gray-300"
            }`}
            title={project.status}
          />
        </div>

        {/* Priority */}
        {project.priority && (
          <div className="text-xs text-gray-500">
            Priority:{" "}
            <span className="font-semibold capitalize">
              {project.priority}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2 min-h-[1.5rem]">
          {project.tags && project.tags.length > 0 ? (
            project.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs rounded-full border bg-gray-100 text-gray-700 whitespace-nowrap"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No tags</span>
          )}
        </div>
      </div>
    // </Link>
  );
}
