"use client";

import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Session } from "next-auth";

interface Employee {
  _id: string;
  full_name: string;
}

interface NewProjectButtonProps {
  role: string | null;
  session?: Session;
  onProjectCreated?: (data: any) => void;
}

const NewProjectButton: React.FC<NewProjectButtonProps> = ({
  role,
  session,
  onProjectCreated,
}) => {
  // ✅ Hooks should be at the top always
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team_lead_id: "",
    members: [] as string[],
    start_date: "",
    end_date: "",
    status: "planned",
    priority: "normal",
    tags: "",
  });

  // ✅ useEffect never inside conditions
  useEffect(() => {
    if (showModal && session?.user?.departmentId) {
      fetchEmployees(session.user.departmentId);
    }
  }, [showModal, session?.user?.departmentId]);

 const fetchEmployees = async (departmentId: string) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/employees/department/${departmentId}`
    );
    const data = await res.json();

    console.log("📥 Employees API Response:", data);

    if (Array.isArray(data)) {
      setEmployees(data);
    } else if (Array.isArray(data.employees)) {
      setEmployees(data.employees);
    } else {
      console.error("❌ Invalid employee data format:", data);
      setEmployees([]);
    }
  } catch (err) {
    console.error("❌ Failed to fetch employees", err);
    setEmployees([]);
  }
};


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, members: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("User session not found");
      return;
    }

    try {
      const payload = {
        ...formData,
        manager_id: session.user.employeeId,
        department_id: session.user.departmentId,
        members: formData.members,
        tags: formData.tags.split(",").map((t) => t.trim()),
      };

      console.log("📤 Sending payload:", payload);

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
        members: [],
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

  // 🟡 Conditional rendering happens here, not before hooks
  if (!role || role !== "manager") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="ml-2 bg-[#65435c] text-white p-2 rounded flex items-center gap-2"
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

              <select
                name="team_lead_id"
                value={formData.team_lead_id}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="">Select Team Lead</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>

              <select
                multiple
                name="members"
                value={formData.members}
                onChange={handleMembersChange}
                className="border px-2 py-1 rounded w-full"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>

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
