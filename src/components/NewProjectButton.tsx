"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Session } from "next-auth";
import mongoose from "mongoose"; 
interface NewProjectButtonProps {
    role: string | null;
    session?: Session; // Pass session from parent
    onProjectCreated?: (data: any) => void;
}

const NewProjectButton: React.FC<NewProjectButtonProps> = ({
    role,
    session,
    onProjectCreated,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        team_lead_id: "",
        members: "",
        start_date: "",
        end_date: "",
        status: "planned",
        priority: "normal",
        tags: "",
    });

    if (!role || role !== "manager") return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

// if you plan to use Typescript backend types

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session?.user) {
    alert("User session not found");
    return;
  }

  try {
    // Convert members and team_lead_id to ObjectIds (24-character hex)
    // Only if they look like valid ObjectId strings
    const convertToObjectId = (id: string) =>
      /^[0-9a-fA-F]{24}$/.test(id) ? id : null;

    const payload = {
      ...formData,
      manager_id: session.user.employeeId,          // should already be valid ObjectId
      department_id: session.user.departmentId,    // should already be valid ObjectId
      team_lead_id: convertToObjectId(formData.team_lead_id),
      members: formData.members
        .split(",")
        .map((m) => m.trim())
        .map(convertToObjectId)
        .filter(Boolean), // remove invalid ids
      tags: formData.tags.split(",").map((t) => t.trim()),
    };

    console.log("Sending payload:", payload);

    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Server error:", data);
      alert("Failed to create project: " + (data.message || "Unknown error"));
      return;
    }

    setShowModal(false);
    setFormData({
      name: "",
      description: "",
      team_lead_id: "",
      members: "",
      start_date: "",
      end_date: "",
      status: "planned",
      priority: "normal",
      tags: "",
    });

    onProjectCreated?.(data);
  } catch (err) {
    console.error(err);
    alert("Failed to create project");
  }
};


    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="ml-2 bg-[#65435c] text-white p-2 rounded flex items-center gap-2"
                aria-label="Add project"
                title="New Project"
            >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">New</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-medium mb-3">New Project</h2>
                        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Project Name"
                                required
                                className="border px-2 py-1 rounded w-full"
                            />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="border px-2 py-1 rounded w-full"
                                rows={2}
                            />
                            <input
                                type="text"
                                name="team_lead_id"
                                value={formData.team_lead_id}
                                onChange={handleChange}
                                placeholder="Team Lead ID"
                                className="border px-2 py-1 rounded w-full"
                            />
                            <input
                                type="text"
                                name="members"
                                value={formData.members}
                                onChange={handleChange}
                                placeholder="Members IDs (comma separated)"
                                className="border px-2 py-1 rounded w-full"
                            />
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            />
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            >
                                <option value="planned">Planned</option>
                                <option value="active">Active</option>
                                <option value="done">Done</option>
                                <option value="canceled">Canceled</option>
                            </select>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="Tags (comma separated)"
                                className="border px-2 py-1 rounded w-full"
                            />
                            <button
                                type="submit"
                                className="bg-[#65435c] text-white py-1 rounded mt-1 hover:bg-[#55394e]"
                            >
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewProjectButton;
