"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Edit2 } from "lucide-react";
import type { Employee, PrivateInfo } from "../../lib/types";
import PrivateInfoForm from "./PrivateInfoForm";

interface PrivateInfoTabProps {
  employee: Employee;
  isAdmin?: boolean;
  canEdit?: boolean;
  refreshData?: () => void;
}

/**
 * Default shape we expect so the UI always shows the same fields (and labels)
 * even when values are empty.
 */
const defaultPrivateInfo: PrivateInfo = {
  emergency: { contact_name: "", contact_phone: "" },
  family_status: { marital_status: "", spouse_name: "", spouse_birthday: "", dependent_children: "" },
  work_permit: { visa_no: "", work_permit: "", visa_expiration: "", permit_expiration: "" },
  private_contact: {
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    private_email: "",
    private_phone: "",
    home_work_distance: "",
    private_car_plate: "",
  },
};

// remove internal DB keys that you don't want displayed or edited
const removeInternalKeys = (obj: any) => {
  if (!obj || typeof obj !== "object") return {};
  const { _id, employee_id, __v, v, ...rest } = obj;
  return rest;
};

const normalizeBackendShape = (raw: any) => {
  const normalized: any = {};
  normalized.emergency = removeInternalKeys(raw.emergency ?? raw.emergencyContact ?? raw.emergency_contact ?? {});
  normalized.family_status = removeInternalKeys(raw.family_status ?? raw.familyStatus ?? raw.family_status ?? {});
  normalized.work_permit = removeInternalKeys(raw.work_permit ?? raw.workPermit ?? raw.work_permit ?? {});
  normalized.private_contact = removeInternalKeys(raw.private_contact ?? raw.privateContact ?? raw.private_contact ?? {});
  return normalized;
};

const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ employee, isAdmin = false, refreshData }) => {
  const private_info_raw = employee?.user?.private_info ?? {};

  const private_info = useMemo(() => normalizeBackendShape(private_info_raw), [private_info_raw]);

  const [formData, setFormData] = useState<any>(() => ({
    ...defaultPrivateInfo,
    ...private_info,
  }));

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData({
      ...defaultPrivateInfo,
      ...normalizeBackendShape(employee?.user?.private_info ?? {}),
    });
  }, [employee?.user?.private_info]);

  const renderSection = (title: string, data: any) => (
    <div key={title}>
      <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
      <div className="space-y-2 text-black">
        {Object.entries(data).map(([key, value]) => (
          <InfoRow
            key={key}
            label={key.replace(/_/g, " ")}
            value={value === "" || value === null || value === undefined ? "-" : value.toString()}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Private Information</h2>
        {isAdmin && (
          <button
            className="p-2 rounded bg-[#65435C] hover:bg-[#54344c] transition"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderSection("Emergency Contact", formData.emergency)}
        {renderSection("Family Status", formData.family_status)}
        {renderSection("Work Permit", formData.work_permit)}
        {renderSection("Private Contact", formData.private_contact)}
      </div>

      {isEditing && (
        <PrivateInfoForm
          employeeId={employee._id}
          initialData={formData}
          onClose={() => setIsEditing(false)}
          onSuccess={(updatedData) => {
            setFormData({
              ...defaultPrivateInfo,
              ...normalizeBackendShape(updatedData || {}),
            });
            setIsEditing(false);
            refreshData?.();
          }}
        />
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
    <span className="text-sm text-gray-500 w-40 flex-shrink-0 capitalize">{label}</span>
    <span className="text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export default PrivateInfoTab;
