"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import axios from "axios";

interface TimesheetFormData {
  project_id: string;
  date: string;
  duration: number;
  description: string;
}

interface TimesheetFormProps {
  role: string;
  employeeId: string;
  onTimesheetCreated?: (data: any) => void;
  onClose?: () => void;
}

const TimesheetForm: React.FC<TimesheetFormProps> = ({
  role,
  employeeId,
  onTimesheetCreated,
  onClose,
}) => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<TimesheetFormData>({
    project_id: "",
    date: "",
    duration: 0,
    description: "",
  });

  // 🧠 Fetch available projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/timesheets/projects/by-role", {
        params: {
          role,
          employee_id: employeeId,
          department_id: (session?.user as any)?.departmentId,
        },
      });

      setProjects(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("❌ Failed to load filtered projects", err);
      setProjects([]);
    }
  };

  // 🧠 Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🧠 Submit timesheet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        employee_id: employeeId,
        project_id: formData.project_id || null,
        description: formData.description || "",
        date: formData.date,
        duration: Number(formData.duration),
      };

      const res = await axios.post("http://localhost:5000/api/timesheets", payload);

      if (onTimesheetCreated) onTimesheetCreated(res.data);
      if (onClose) onClose(); // ✅ close modal
    } catch (err: any) {
      console.error("❌ Failed to create timesheet:", err);
      alert("Failed to create timesheet: " + err.message);
    }
  };

  // 🧱 UI
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-medium mb-3">New Timesheet</h2>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          {/* Project Selection */}
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">Select Project</option>
            {projects.map((proj) => (
              <option key={proj._id} value={proj._id}>
                {proj.name}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded w-full"
          />

          {/* Duration */}
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Hours spent"
            min="0"
            step="0.25"
            required
            className="border px-2 py-1 rounded w-full"
          />

          {/* Description */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border px-2 py-1 rounded w-full resize-none"
            rows={2}
          />

          <button
            type="submit"
            className="bg-[#65435c] text-white py-1 rounded mt-1 hover:bg-[#55394e]"
          >
            Save Timesheet
          </button>
        </form>
      </div>
    </div>
  );
};

export default TimesheetForm;
