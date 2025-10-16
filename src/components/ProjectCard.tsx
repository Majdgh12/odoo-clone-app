"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react"; // Icon from lucide
import { useSession } from "next-auth/react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  status?: string;
  priority?: string;
  department_id?: { _id: string };
}

export default function ProjectCard({ project, onDelete }: { project: Project; onDelete?: () => void }) {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      setDeleting(true);
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.user?.token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete project");

      alert("Project deleted successfully!");
      if (onDelete) onDelete();
    } catch (err: any) {
      console.error("❌ Delete failed:", err);
      alert(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/projects/${project._id}`} className="block w-full h-full">
      <div
        className={`relative w-full h-auto min-h-fit flex flex-col gap-2 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer ${
          hovered ? "ring-1 ring-purple-300" : ""
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Delete icon for manager */}
        {userRole === "manager" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute bottom-2 right-2 text-red-500 hover:text-red-700"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        )}

        {/* Project Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-black truncate">{project.name}</h2>
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
            Priority: <span className="font-semibold capitalize">{project.priority}</span>
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
    </Link>
  );
}
