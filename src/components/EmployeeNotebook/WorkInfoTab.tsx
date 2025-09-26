"use client";

import React, { useState } from "react";
import { Edit2, X } from "lucide-react";
import type { Employee, WorkInfo, WorkPermit } from "../../lib/types";

interface WorkInfoTabProps {
  employee: Employee;
  isAdmin?: boolean;
  canEdit?: boolean;
  refreshData?: () => void; // Optional callback to refresh parent data
}

const WorkInfoTab: React.FC<WorkInfoTabProps> = ({ employee, isAdmin = false, refreshData }) => {
  const work_info: WorkInfo | undefined = employee.user?.work_info;
  const work_permit: WorkPermit = employee.user?.work_permit ?? {
    visa_no: "",
    work_permit: "",
    visa_expiration: "",
    permit_expiration: "",
  };

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    work_address: work_info?.work_address ?? "",
    work_location: work_info?.work_location ?? "",
    working_hours: work_info?.working_hours ?? "",
    timezone: work_info?.timezone ?? "",
    approver_timeoff_id: work_info?.approver_timeoff_id ?? "",
    approver_timesheet_id: work_info?.approver_timesheet_id ?? "",
    visa_no: work_permit?.visa_no ?? "",
    work_permit: work_permit?.work_permit ?? "",
    visa_expiration: work_permit?.visa_expiration ?? "",
    permit_expiration: work_permit?.permit_expiration ?? "",
  });

  if (!work_info) return <p className="text-gray-500">No work information available.</p>;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      const body = {
        workInfo: {
          work_address: formData.work_address,
          work_location: formData.work_location,
          working_hours: formData.working_hours,
          timezone: formData.timezone,
          approver_timeoff_id: formData.approver_timeoff_id || null,
          approver_timesheet_id: formData.approver_timesheet_id || null,
        },
        workPermit: {
          visa_no: formData.visa_no || null,
          work_permit: formData.work_permit || null,
          visa_expiration: formData.visa_expiration || null,
          permit_expiration: formData.permit_expiration || null,
        },
      };

      const res = await fetch(
        `http://localhost:5000/api/work-info/employee/${employee._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      // Update state with fresh data
      setFormData({
        work_address: data.workInfo?.work_address ?? "",
        work_location: data.workInfo?.work_location ?? "",
        working_hours: data.workInfo?.working_hours ?? "",
        timezone: data.workInfo?.timezone ?? "",
        approver_timeoff_id: data.workInfo?.approver_timeoff_id ?? "",
        approver_timesheet_id: data.workInfo?.approver_timesheet_id ?? "",
        visa_no: data.workPermit?.visa_no ?? "",
        work_permit: data.workPermit?.work_permit ?? "",
        visa_expiration: data.workPermit?.visa_expiration ?? "",
        permit_expiration: data.workPermit?.permit_expiration ?? "",
      });

      setIsEditing(false);
      if (refreshData) refreshData();
    } catch (error: any) {
      console.error("Failed to save work info:", error.message);
      alert(`Error saving data: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Work Info Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
          {isAdmin && (
            <button
              className="p-2 rounded bg-[#65435C] hover:bg-[#54344c] transition"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfoRow label="Work Address" value={formData.work_address} />
          <InfoRow label="Work Location" value={formData.work_location} />
          <InfoRow label="Working Hours" value={formData.working_hours} />
          <InfoRow label="Timezone" value={formData.timezone} />
          <InfoRow label="Time Off Approver" value={formData.approver_timeoff_id} />
          <InfoRow label="Timesheet Approver" value={formData.approver_timesheet_id} />
          <InfoRow label="Visa No" value={formData.visa_no} />
          <InfoRow label="Work Permit" value={formData.work_permit} />
          <InfoRow label="Visa Expiration" value={formData.visa_expiration?.toString()} />
          <InfoRow label="Permit Expiration" value={formData.permit_expiration?.toString()} />
        </div>
      </div>

      {/* Popup Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Edit Work Information</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-500 mb-1 capitalize">{key.replace("_", " ")}</label>
                  <input
                    type="text"
                    className="border p-2 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    value={value ?? ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                </div>
              ))}
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

interface InfoRowProps {
  label: string;
  value?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-start">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export default WorkInfoTab;
