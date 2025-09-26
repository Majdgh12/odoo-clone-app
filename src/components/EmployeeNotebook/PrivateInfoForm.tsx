"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";

interface PrivateInfoFormProps {
  employeeId: string;
  initialData: any;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const defaultPrivateInfo = {
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

const removeInternalKeys = (obj: any) => {
  if (!obj || typeof obj !== "object") return {};
  const { _id, employee_id, __v, v, ...rest } = obj;
  return rest;
};

const isDateKey = (key: string) => {
  const normalized = key.toLowerCase();
  return normalized.includes("date") || normalized.includes("birthday") || normalized.includes("expiration");
};

const toDateInputValue = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const PrivateInfoForm: React.FC<PrivateInfoFormProps> = ({ employeeId, initialData, onClose, onSuccess }) => {
  const mergedInitial = useMemo(() => {
    const out: any = {};
    Object.keys(defaultPrivateInfo).forEach((section) => {
      const rawSection = removeInternalKeys(initialData?.[section] ?? {});
      out[section] = { ...(defaultPrivateInfo as any)[section], ...rawSection };
    });
    return out;
  }, [initialData]);

  const [form, setForm] = useState<any>(mergedInitial);
  const [saving, setSaving] = useState(false);

  const sectionKeys = (section: string) => {
    const keys = new Set<string>(Object.keys((defaultPrivateInfo as any)[section] || {}));
    Object.keys(form[section] || {}).forEach((k) => keys.add(k));
    return Array.from(keys);
  };

  const handleChange = (section: string, key: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const preparePayloadForBackend = (current: any) => {
    const mapSectionName: Record<string, string> = {
      emergency: "emergencyContact",
      family_status: "familyStatus",
      work_permit: "workPermit",
      private_contact: "privateContact",
    };

    const payload: any = {};
    Object.entries(current).forEach(([section, obj]) => {
      const backendKey = mapSectionName[section] ?? section;
      const outObj: any = {};
      Object.entries(obj as any).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) {
          outObj[k] = v === "" ? "" : v;
        } else if (isDateKey(k)) {
          const date = new Date(v);
          if (!isNaN(date.getTime())) outObj[k] = date.toISOString();
          else outObj[k] = v;
        } else {
          outObj[k] = v;
        }
      });
      payload[backendKey] = outObj;
    });
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = preparePayloadForBackend(form);
      console.log("[PrivateInfoForm] Saving payload:", { employeeId, payload });

      const res = await fetch(`http://localhost:5000/api/private-info/employee/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawText: text };
      }

      console.log("[PrivateInfoForm] Server response status:", res.status, "body:", data);

      if (!res.ok) {
        const msg = data?.message || data?.error || JSON.stringify(data);
        throw new Error(`Server error: ${msg}`);
      }

      const normalizedResult: any = {};
      normalizedResult.emergency = removeInternalKeys(data.emergency ?? data.emergencyContact ?? {});
      normalizedResult.family_status = removeInternalKeys(data.family_status ?? data.familyStatus ?? {});
      normalizedResult.work_permit = removeInternalKeys(data.work_permit ?? data.workPermit ?? {});
      normalizedResult.private_contact = removeInternalKeys(data.private_contact ?? data.privateContact ?? {});

      onSuccess({
        emergency: normalizedResult.emergency,
        family_status: normalizedResult.family_status,
        work_permit: normalizedResult.work_permit,
        private_contact: normalizedResult.private_contact,
      });
    } catch (err: any) {
      console.error("[PrivateInfoForm] Save error:", err);
      alert("Failed to save private info: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <button className="absolute top-4 right-4 text-gray-600" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4">Edit Private Information</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.keys(defaultPrivateInfo).map((section) => (
            <div key={section}>
              <h4 className="font-semibold mb-2 capitalize">{section.replace(/_/g, " ")}</h4>
              <div className="space-y-3">
                {sectionKeys(section).map((key) => {
                  const value = form[section]?.[key] ?? "";
                  const isDate = isDateKey(key);
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">{key.replace(/_/g, " ")}</label>

                      {isDate ? (
                        <input
                          type="date"
                          value={toDateInputValue(value)}
                          onChange={(e) => handleChange(section, key, e.target.value)}
                          className="border p-2 rounded"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value ?? ""}
                          onChange={(e) => handleChange(section, key, e.target.value)}
                          className="border p-2 rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-[#65435C] text-white hover:bg-[#54344c]"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateInfoForm;
