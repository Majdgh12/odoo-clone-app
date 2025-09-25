/* eslint-disable @next/next/no-img-element */
// components/EmployeeGeneral.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // session hook
import type { Employee } from "../lib/types";
import ResumeTab from "./EmployeeNotebook/ResumeTab";
import WorkInfoTab from "./EmployeeNotebook/WorkInfoTab";
import PrivateInfoTab from "./EmployeeNotebook/PrivateInfoTab";
import SettingsTab from "./EmployeeNotebook/SettingsTab";
import { Home as HomeIcon, ChevronLeft, ChevronRight, Edit2, Save, X } from "lucide-react";

interface EmployeeGeneralProps {
  employee: Employee | null;
  employees: Employee[];
}

// Helper to convert field to string
const toStringField = (val: any): string => {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    if (typeof val.company === "string") return val.company;
    if (val._id) return String(val._id);
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return "";
};

// Helper to normalize tags
const normalizeTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => (typeof t === "string" ? t : t?.name ?? String(t)));
  }
  return [typeof tags === "string" ? tags : tags?.name ?? String(tags)];
};

// Get ID of object
const idOf = (obj: any): string | undefined => {
  if (!obj) return undefined;
  return obj.id ?? obj._id ?? obj.toString?.();
};

const EmployeeGeneral: React.FC<EmployeeGeneralProps> = ({ employee, employees }) => {
  const router = useRouter();
  const { data: session } = useSession(); // session data
  const [activeTab, setActiveTab] = useState("resume");

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
          <p className="text-gray-600">The employee with this ID does not exist.</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin"; // admin check
  const currentIndex = employees.findIndex(
    (e) => String(idOf(e)) === String(idOf(employee))
  );

  const navigateToEmployee = (direction: "prev" | "next") => {
    if (!employees.length) return;
    const lastIndex = employees.length - 1;
    const newIndex =
      direction === "next"
        ? currentIndex < lastIndex
          ? currentIndex + 1
          : 0
        : currentIndex > 0
          ? currentIndex - 1
          : lastIndex;

    const newEmployee = employees[newIndex];
    const newId = idOf(newEmployee);
    if (newId) router.push(`/employees/${newId}`);
  };

  const info = employee.user?.general_info ?? {};
  const departmentText = toStringField(info.department);
  const companyText = toStringField(info.company);
  const tags = normalizeTags(info.tags);

  // Editable mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: info.full_name ?? "",
    job_position: info.job_position ?? "",
    work_email: info.work_email ?? "",
    work_phone: info.work_phone ?? "",
    work_mobile: info.work_mobile ?? "",
    tags: tags.join(", "),
    company: companyText ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const employeeId = idOf(employee);
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("❌ Error updating employee:", err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: info.full_name ?? "",
      job_position: info.job_position ?? "",
      work_email: info.work_email ?? "",
      work_phone: info.work_phone ?? "",
      work_mobile: info.work_mobile ?? "",
      tags: tags.join(", "),
      company: companyText ?? "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Home"
          >
            <HomeIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-4 py-2">
            <button
              onClick={() => navigateToEmployee("prev")}
              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={employees.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 font-medium">
              {currentIndex + 1} / {employees.length}
            </span>
            <button
              onClick={() => navigateToEmployee("next")}
              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={employees.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="text-3xl font-bold text-gray-900 border p-1 rounded w-1/2"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mr-3">
                    {info.full_name ?? "—"}
                  </h1>
                )}
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-4 p-2 rounded transition flex items-center justify-center"
                    style={{ backgroundColor: "#65435C" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#54344c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#65435C")
                    }
                    title="Edit Employee"
                  >
                    <Edit2 className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              <p className="text-lg text-gray-600 mb-8">
                {isEditing ? (
                  <input
                    type="text"
                    name="job_position"
                    value={formData.job_position}
                    onChange={handleChange}
                    className="border p-1 rounded w-1/2"
                  />
                ) : (
                  info.job_position ?? "—"
                )}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
                {/* Editable left */}
                <div className="space-y-6">
                  {[
                    { label: "Work Email", name: "work_email" },
                    { label: "Work Phone", name: "work_phone" },
                    { label: "Work Mobile", name: "work_mobile" },
                    { label: "Tags", name: "tags" },
                    { label: "Company", name: "company" },
                  ].map((field) => (
                    <div key={field.name} className="flex items-start">
                      <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                        {field.label}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name={field.name}
                          value={(formData as any)[field.name]}
                          onChange={handleChange}
                          className="border p-1 rounded w-1/2 ml-4"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 ml-4">
                          {(info as any)[field.name] ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Static right */}
                <div className="space-y-6">
                  {[
                    { label: "Department", value: departmentText },
                    { label: "Coach", value: info.coach?.name ?? "—" },
                    { label: "Manager", value: info.manager?.name ?? "—" },
                  ].map((field, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                        {field.label}
                      </span>
                      <span className="text-sm text-gray-900 ml-4">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save / Cancel */}
              {isEditing && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1 bg-[#65435C] text-white rounded-full hover:bg-[#54344c] transition"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-3 py-1 bg-[#65435C] text-white rounded-full hover:bg-[#54344c] transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Photo */}
            <div className="ml-8 flex-shrink-0">
              <img
                src={info.image}
                alt={info.full_name}
                className="w-32 h-40 rounded-lg object-cover border border-gray-200"
                onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/128x160.png?text=No+Photo")
                }
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: "resume", label: "Resume" },
              { id: "work", label: "Work Information" },
              { id: "private", label: "Private Information" },
              { id: "settings", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === "resume" && <ResumeTab employee={employee} isAdmin={isAdmin}/>}
          {activeTab === "work" && <WorkInfoTab employee={employee} isAdmin={isAdmin}/>}
          {activeTab === "private" && <PrivateInfoTab employee={employee} isAdmin={isAdmin}/>}
          {activeTab === "settings" && <SettingsTab employee={employee} isAdmin={isAdmin}/>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeGeneral;
