/* eslint-disable @next/next/no-img-element */
// components/EmployeeGeneral.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

const idOf = (obj: any): string | undefined => {
  if (!obj) return undefined;
  return obj.id ?? obj._id ?? obj.toString?.();
};

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

  const isAdmin = session?.user?.role === "admin";
  const isManager = session?.user?.role === "manager";
  const managerDeptId = session?.user?.departmentId;
  const employeeDeptId = employee.user?.general_info?.department?._id ?? employee.department_id;
  const currentUserId = session?.user?.employeeId;

  const canEdit =
    isAdmin || (isManager && managerDeptId && String(managerDeptId) === String(employeeDeptId));

  const canEditImage = String(currentUserId) === String(employee._id);

  console.log("Can edit info?", canEdit);
  console.log("Can edit image?", canEditImage);

  const currentIndex = employees.findIndex((e) => String(idOf(e)) === String(idOf(employee)));

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

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: info.full_name ?? "",
    job_position: info.job_position ?? "",
    work_email: info.work_email ?? "",
    work_phone: info.work_phone ?? 0,
    work_mobile: info.work_mobile ?? 0,
    tags: tags.join(", "),
    company: companyText ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value,type } = e.target;

  if (name === "work_phone" || name === "work_mobile") {
    const numericValue = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: 0 }));
    }
  } else {
    // Handle other fields (email, name, etc.)
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSave = async () => {
    try {
      const employeeId = idOf(employee);
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok){
          const errortext = await res.text();
      console.log("✅ Employee updated:", errortext);
      console.log("status code:", res.status);
      throw new Error(`Failed to update employee: ${res.status} - ${errortext}`);
    }
    
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
      work_phone: info.work_phone ?? 0,
      work_mobile: info.work_mobile ?? 0,
      tags: tags.join(", "),
      company: companyText ?? "",
    });
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(file);

      // Send to backend
      const res = await fetch(
        `http://localhost:5000/api/employees/${employee._id}/image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Image }),
        }
      );

      if (!res.ok) throw new Error("Failed to update image");
      
      const data = await res.json();
      console.log("Image updated:", data);
      router.refresh();
    } catch (err) {
      console.error("❌ Error updating image:", err);
      alert("Failed to update image. Please try again.");
    }
  };

  // Get image source - use base64 from database or placeholder
  const getImageSrc = () => {
    if (info.image && info.image.startsWith('data:image/')) {
      return info.image; // Use base64 directly
    }
    return "https://via.placeholder.com/128x160.png?text=No+Photo";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/homeEmployee")}
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
                {/*abdalmajid edit here*/}
<div className="space-y-6">
  {/* Work Email */}
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">WORK EMAIL</span>
    {isEditing ? (
      <input
        type="email"
        name="work_email"
        value={formData.work_email}
        onChange={handleChange}
        className="border p-1 rounded w-1/2 ml-4"
        placeholder="user@company.com"
      />
    ) : (
      <span className="text-sm text-gray-900 ml-4">{info.work_email ?? "—"}</span>
    )}
  </div>

  {/* Work Phone */}
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">WORK PHONE</span>
    {isEditing ? (
      <div className="flex gap-2 ml-4">
      <input
        type="number"
        name="work_phone"
        value={formData.work_phone}
        onChange={handleChange}
        className="border p-1 rounded w-1/2 ml-4"
        placeholder="71123456"
        min="0"
      />
      </div>
    ) : (
      <span className="text-sm text-gray-900 ml-4">
        {info.work_phone ?? "—"}
      </span>
    )}
  </div>

  {/* Work Mobile */}
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">WORK MOBILE</span>
    {isEditing ? (
      <div className="flex gap-2 ml-4">
 
      <input
        type="number"
        name="work_mobile"
        value={formData.work_mobile}
        onChange={handleChange}
        className="border p-1 rounded w-1/2 ml-4"
        placeholder="71123456"
        min="0"
      />
      </div>
    ) : (
      <span className="text-sm text-gray-900 ml-4">
        {info.work_mobile?? "—"}
      </span>
    )}
  </div>

  {/* Tags */}
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">TAGS</span>
    {isEditing ? (
      <input
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        className="border p-1 rounded w-1/2 ml-4"
      />
    ) : (
      <span className="text-sm text-gray-900 ml-4">{info.tags ?? "—"}</span>
    )}
  </div>

  {/* Company */}
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">COMPANY</span>
    {isEditing ? (
      <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleChange}
        className="border p-1 rounded w-1/2 ml-4"
      />
    ) : (
      <span className="text-sm text-gray-900 ml-4">{info.company ?? "—"}</span>
    )}
  </div>
</div>
        {/* abdalmajid edit end */}          
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
                src={getImageSrc()}
                alt={info.full_name}
                className="w-32 h-40 rounded-lg object-cover border border-gray-200"
              />
              {canEditImage && (
                <label className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded cursor-pointer text-xs hover:bg-gray-700 transition">
                  Edit
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
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