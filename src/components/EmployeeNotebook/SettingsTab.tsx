"use client";

import React, { useState, useEffect } from "react";
import { Edit2, X } from "lucide-react";
import type { Employee } from "../../lib/types";

interface SettingsTabProps {
  employee: Employee;
  isAdmin?: boolean;
  refreshData?: () => void;
}

// ✅ Only editable fields in defaults
const defaultSettings = {
  employee_type: "",
  related_user: "",
  hourly_cost: "",
  pos_pin_code: "",
  badge_id: "",
};

const SettingsTab: React.FC<SettingsTabProps> = ({
  employee,
  isAdmin = false,
  refreshData,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // ✅ formData contains only editable fields, IDs removed
  const [formData, setFormData] = useState<any>({ ...defaultSettings });

  useEffect(() => {
    // Merge backend settings but remove any id/employee_id fields
    const { _id, employee_id, ...editableSettings } = employee.user?.settings || {};
    setFormData({ ...defaultSettings, ...editableSettings });
  }, [employee]);

  const handleInputChange = (path: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] || {};
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };

      const res = await fetch(
        `http://localhost:5000/api/employee-settings/employee/${employee._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      const { _id, employee_id, ...editableSettings } = data.settings || {};
      setFormData({ ...defaultSettings, ...editableSettings });

      setIsEditing(false);
      if (refreshData) refreshData();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const formatLabel = (label: string) =>
    label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const renderObject = (obj: any, path = "") => {
    if (!obj || Object.keys(obj).length === 0)
      return <p className="text-gray-500">No data</p>;

    return (
      <div className="space-y-4">
        {Object.entries(obj).map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (value && typeof value === "object" && !Array.isArray(value)) {
            return (
              <div key={currentPath} className="ml-4">
                <h4 className="text-gray-700 font-medium capitalize">
                  {formatLabel(key)}
                </h4>
                {renderObject(value, currentPath)}
              </div>
            );
          } else {
            return (
              <div key={currentPath} className="flex items-start">
                <span className="text-sm text-gray-500 w-40 flex-shrink-0 mt-1 capitalize">
                  {formatLabel(key)}
                </span>
                <span className="text-sm text-gray-900 ml-4">
                  {value !== undefined && value !== "" ? value : "-"}
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderEditFields = (obj: any, path = "") => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={currentPath} className="ml-4">
            <h4 className="text-gray-700 font-medium capitalize">
              {formatLabel(key)}
            </h4>
            {renderEditFields(value, currentPath)}
          </div>
        );
      } else {
        return (
          <div key={currentPath} className="flex flex-col mb-2">
            <label className="text-sm text-gray-500 mb-1 capitalize">
              {formatLabel(key)}
            </label>
            <input
              type="text"
              className="border p-2 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
              value={value ?? ""}
              onChange={(e) => handleInputChange(currentPath, e.target.value)}
            />
          </div>
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SETTINGS</h3>
        {isAdmin && (
          <button
            className="p-2 rounded bg-[#65435C] hover:bg-[#54344c] transition"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* ✅ Display IDs in main UI */}
      <div className="space-y-4 mb-4">
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-40 flex-shrink-0 mt-1">ID</span>
          <span className="text-sm text-gray-900 ml-4">{employee._id}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-40 flex-shrink-0 mt-1">Employee ID</span>
          <span className="text-sm text-gray-900 ml-4">{employee._id}</span>
        </div>
      </div>

      {/* Display editable settings */}
      {renderObject(formData)}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Edit Settings</h3>

            {/* ✅ Read-only ID fields */}
            <div className="flex flex-col mb-2">
              <label className="text-sm text-gray-500 mb-1">ID</label>
              <input
                type="text"
                value={employee._id}
                readOnly
                className="border p-2 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col mb-2">
              <label className="text-sm text-gray-500 mb-1">Employee ID</label>
              <input
                type="text"
                value={employee._id}
                readOnly
                className="border p-2 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderEditFields(formData)}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#65435C] text-white hover:bg-[#54344c]"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
