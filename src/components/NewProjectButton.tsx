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

    // 🔹 Removed assignTeamLead from here — project does not exist yet
  };

  const assignTeamLead = async (projectId: string, teamLeadId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/assign-team-lead`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team_lead_id: teamLeadId }),
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {
        console.warn("No JSON returned from server");
      }

      if (!res.ok) {
        console.error("Failed to assign team lead:", data);
      } else {
        console.log("✅ Team lead assigned:", data);
      }
    } catch (err) {
      console.error("❌ Error assigning team lead:", err);
    }
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
      // 🔹 Prepare payload for project creation
      const payload = {
        ...formData,
        manager_id: session.user.employeeId,
        department_id: session.user.departmentId,
        members: formData.members,
        tags: formData.tags.split(",").map((t) => t.trim()),
      };

      console.log("📤 Sending payload:", payload);

      // 🔹 Create project
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📤 Project creation response:", data);

      if (!res.ok) {
        console.error("Server error:", data);
        alert("Failed to create project: " + (data.message || "Unknown error"));
        return;
      }

      // 🔹 Safely extract project ID from response
      const projectId = data?.data?._id;

      if (!projectId) {
        console.warn(
          "Project ID not found in response. Team lead will not be assigned.",
          data
        );
      }

      // 🔹 Assign team lead if selected and project ID exists
      if (formData.team_lead_id && projectId) {
        await assignTeamLead(projectId, formData.team_lead_id);
      }

      // 🔹 Reset form and close modal
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

      // 🔹 Notify parent component of the new project
      onProjectCreated?.(data);
    } catch (err) {
      console.error("❌ Error creating project:", err);
      alert("Failed to create project");
    }
  };


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
              <div className="border px-2 py-1 rounded w-full max-h-40 overflow-y-auto">
                <p className="font-medium mb-1">Select Members:</p>
                {employees
                  .filter((emp) => emp._id !== formData.team_lead_id) // exclude team lead
                  .map((emp) => (
                    <label key={emp._id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        value={emp._id}
                        checked={formData.members.includes(emp._id)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          setFormData((prev) => ({
                            ...prev,
                            members: checked
                              ? [...prev.members, value]
                              : prev.members.filter((id) => id !== value),
                          }));
                        }}
                        className="w-4 h-4"
                      />
                      <span>{emp.full_name}</span>
                    </label>
                  ))}
              </div>

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
