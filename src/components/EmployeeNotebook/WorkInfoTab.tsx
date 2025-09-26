// File: components/WorkInfoTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit2, X } from "lucide-react";
import type { Employee, WorkInfo } from "../../lib/types";

interface WorkInfoTabProps {
  employee: Employee;
  isAdmin?: boolean;
  refreshData?: () => void;
}

/* ---------- Helpers ---------- */

// sanitize object by removing internal DB keys before using/displaying
const removeInternalKeys = (obj: any) => {
  if (!obj || typeof obj !== "object") return {};
  const { _id, employee_id, v, __v, ...rest } = obj;
  return rest;
};

// produce safe work info for form/UI (map missing fields to "")
const sanitizeWorkInfo = (raw: any) => {
  const safe = removeInternalKeys(raw || {});
  return {
    work_address: safe.work_address ?? "",
    work_location: safe.work_location ?? "",
    working_hours: safe.working_hours ?? "",
    timezone: safe.timezone ?? "",
    approver_timeoff_id: safe.approver_timeoff_id ?? "",
    approver_timesheet_id: safe.approver_timesheet_id ?? "",
  };
};

const emptyWorkInfo = {
  work_address: "",
  work_location: "",
  working_hours: "",
  timezone: "",
  approver_timeoff_id: "",
  approver_timesheet_id: "",
};

/* ---------- Component ---------- */

const WorkInfoTab: React.FC<WorkInfoTabProps> = ({ employee, isAdmin = false, refreshData }) => {
  const dbWorkInfo = useMemo(() => employee.user?.work_info ?? null, [employee.user?.work_info]);

  const [formData, setFormData] = useState({ ...emptyWorkInfo });
  const [isEditing, setIsEditing] = useState(false);

  // sync DB -> formData
  useEffect(() => {
    setFormData({ ...sanitizeWorkInfo(dbWorkInfo) });
  }, [dbWorkInfo]);

  const displayValue = (val: any) => (val === undefined || val === null || val === "" ? "-" : String(val));

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // handle save (only workInfo)
  const handleSave = async () => {
    try {
      const body = { workInfo: { ...formData } };
      console.log("Payload to backend:", body); // log payload

      const res = await fetch(`http://localhost:5000/api/work-info/employee/${employee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      setFormData(sanitizeWorkInfo(data.workInfo || dbWorkInfo));
      setIsEditing(false);
      refreshData?.();
    } catch (err: any) {
      console.error("Failed to save work info:", err);
      alert(`Error saving data: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Work Info Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
          {isAdmin && (
            <button className="p-2 rounded bg-[#65435C] hover:bg-[#54344c] transition" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfoRow label="Work Address" value={displayValue(formData.work_address)} />
          <InfoRow label="Work Location" value={displayValue(formData.work_location)} />
          <InfoRow label="Working Hours" value={displayValue(formData.working_hours)} />
          <InfoRow label="Timezone" value={displayValue(formData.timezone)} />
          <InfoRow label="Time Off Approver" value={displayValue(formData.approver_timeoff_id)} />
          <InfoRow label="Timesheet Approver" value={displayValue(formData.approver_timesheet_id)} />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => setIsEditing(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Edit Work Information</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InputField label="Work Address" value={formData.work_address} onChange={(v) => handleInputChange("work_address", v)} />
              <InputField label="Work Location" value={formData.work_location} onChange={(v) => handleInputChange("work_location", v)} />
              <InputField label="Working Hours" value={formData.working_hours} onChange={(v) => handleInputChange("working_hours", v)} />
              <InputField label="Timezone" value={formData.timezone} onChange={(v) => handleInputChange("timezone", v)} />
              <InputField label="Time Off Approver (ID)" value={formData.approver_timeoff_id} onChange={(v) => handleInputChange("approver_timeoff_id", v)} />
              <InputField label="Timesheet Approver (ID)" value={formData.approver_timesheet_id} onChange={(v) => handleInputChange("approver_timesheet_id", v)} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-[#65435C] text-white hover:bg-[#54344c]" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-500 mb-1">{label}</label>
    <input type="text" className="border p-2 rounded-lg" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export default WorkInfoTab;
