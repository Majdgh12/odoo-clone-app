"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AddProjectModal({ isOpen, onClose, onProjectAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("planned");
  const [priority, setPriority] = useState("normal");
  const [tags, setTags] = useState("");

  // ✅ Fetch Departments and Employees for dropdowns
  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:5000/api/projects").then((res) => setDepartments(res.data));
      axios.get("http://localhost:5000/api/employees").then((res) => setEmployees(res.data));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        name,
        description,
        department_id: departmentId || null,
        manager_id: managerId || null,
        team_lead_id: teamLeadId || null,
        members,
        status,
        priority,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const res = await axios.post("/api/projects", projectData);
      onProjectAdded(res.data);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setDepartmentId("");
    setManagerId("");
    setTeamLeadId("");
    setMembers([]);
    setStatus("planned");
    setPriority("normal");
    setTags("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg p-2"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          {/* Department */}
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Manager */}
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select Manager</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Team Lead */}
          <select
            value={teamLeadId}
            onChange={(e) => setTeamLeadId(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select Team Lead</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Members */}
          <div>
            <label className="block text-sm mb-1">Members</label>
            <select
              multiple
              value={members}
              onChange={(e) =>
                setMembers(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              className="w-full border rounded-lg p-2 h-24"
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Tags */}
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
