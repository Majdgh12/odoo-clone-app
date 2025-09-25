"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Edit2, X } from "lucide-react";
import type { Employee, PrivateInfo } from "../../lib/types";

interface PrivateInfoTabProps {
  employee: Employee;
  isAdmin?: boolean;
  refreshData?: () => void;
}

const defaultPrivateInfo: PrivateInfo = {
  education: { degree: "", school: "", graduation_date: "" },
  emergency: { contact_name: "", contact_phone: "" },
  family_status: { marital_status: "", spouse_name: "", spouse_birthday: "", dependent_children: "" },
  work_permit: { visa_no: "", work_permit: "", visa_expiration: "", permit_expiration: "" },
  private_contact: { street: "", street2: "", city: "", state: "", zip: "", country: "", private_email: "", private_phone: "", home_work_distance: "", private_car_plate: "" },
};

// Remove internal DB keys
const removeInternalKeys = (obj: any) => {
  if (!obj) return {};
  const { _id, employee_id, v, ...rest } = obj;
  return rest;
};

const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ employee, isAdmin = false, refreshData }) => {
  // Memoize private info to avoid infinite loop
  const private_info: PrivateInfo = useMemo(() => {
    return removeInternalKeys(employee.user?.private_info || {});
  }, [employee.user?.private_info]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultPrivateInfo);

  // Initialize formData safely when private_info changes
  useEffect(() => {
    setFormData({
      education: { ...defaultPrivateInfo.education, ...removeInternalKeys(private_info.education || {}) },
      emergency: { ...defaultPrivateInfo.emergency, ...removeInternalKeys(private_info.emergency || {}) },
      family_status: { ...defaultPrivateInfo.family_status, ...removeInternalKeys(private_info.family_status || {}) },
      work_permit: { ...defaultPrivateInfo.work_permit, ...removeInternalKeys(private_info.work_permit || {}) },
      private_contact: { ...defaultPrivateInfo.private_contact, ...removeInternalKeys(private_info.private_contact || {}) },
    });
  }, [private_info]);

  // Handle input changes in form
  const handleInputChange = (section: string, key: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  // Save data to backend
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/private-info/employee/${employee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      // Remove internal fields from backend response
      setFormData({
        education: { ...defaultPrivateInfo.education, ...removeInternalKeys(data.education || {}) },
        emergency: { ...defaultPrivateInfo.emergency, ...removeInternalKeys(data.emergency || {}) },
        family_status: { ...defaultPrivateInfo.family_status, ...removeInternalKeys(data.family_status || {}) },
        work_permit: { ...defaultPrivateInfo.work_permit, ...removeInternalKeys(data.work_permit || {}) },
        private_contact: { ...defaultPrivateInfo.private_contact, ...removeInternalKeys(data.private_contact || {}) },
      });

      setIsEditing(false);
      refreshData?.();
    } catch (error: any) {
      console.error("Error saving private info:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Render a section (Education, Emergency, etc.)
  const renderSection = (title: string, data: any) => (
    <div key={title}>
      <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
      <div className="space-y-2 text-black">
        {Object.entries(removeInternalKeys(data)).map(([key, value]) => (
          <InfoRow key={key} label={key.replace(/_/g, " ")} value={value?.toString() || "-"} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Private Information</h2>
        {isAdmin && (
          <button className="p-2 rounded bg-[#65435C] hover:bg-[#54344c] transition" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderSection("Education", formData.education)}
        {renderSection("Emergency Contact", formData.emergency)}
        {renderSection("Family Status", formData.family_status)}
        {renderSection("Work Permit", formData.work_permit)}
        {renderSection("Private Contact", formData.private_contact)}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setIsEditing(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Edit Private Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(formData).map(([section, sectionData]) =>
                Object.entries(sectionData as any).map(([key, value]) => (
                  <div key={`${section}-${key}`} className="flex flex-col">
                    <label className="text-sm text-gray-500 mb-1 capitalize">
                      {section.replace(/_/g, " ")} - {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      className="border p-2 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      value={value ?? ""}
                      onChange={(e) => handleInputChange(section, key, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-[#65435C] text-white hover:bg-[#54344c] transition" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Info row component
interface InfoRowProps {
  label: string;
  value?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0 capitalize">{label}</span>
    <span className="text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export default PrivateInfoTab;
