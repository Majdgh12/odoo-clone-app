// UpdatePrivateInfoTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  PrivateInfo,
  PrivateContact,
  Emergency,
  FamilyStatus,
  Education,
  WorkPermit,
} from "../../lib/types";

interface UpdatePrivateInfoTabProps {
  employeeId: string;
  apiBaseUrl: string;
}

const UpdatePrivateInfoTab: React.FC<UpdatePrivateInfoTabProps> = ({
  employeeId,
  apiBaseUrl,
}) => {
  const [privateInfo, setPrivateInfo] = useState<PrivateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPrivateInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch private info");
      const data = await res.json();

      const mappedInfo: PrivateInfo = {
        private_contact: data.contact || {},
        family_status: data.familyStatus || {},
        emergency: data.emergencyContacts?.[0] || {},
        education: data.educationPrivates?.[0] || {},
        work_permit: data.workPermits?.[0] || {},
      };

      setPrivateInfo(mappedInfo);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch private info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivateInfo();
  }, [employeeId]);

  const handleChange = (
    section: keyof PrivateInfo,
    field: string,
    value: any
  ) => {
    setPrivateInfo((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    if (!privateInfo) return;
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/employees/${employeeId}/private-info`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(privateInfo),
        }
      );
      if (!res.ok) {
        const resJson = await res.json();
        throw new Error(resJson?.error || "Update failed");
      }
      alert("Information updated successfully!");
      fetchPrivateInfo(); // refresh inputs
    } catch (err: any) {
      console.error(err);
      alert("Failed to update info: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!privateInfo) return <p className="text-gray-500">No private info found</p>;

  const { education, emergency, family_status, private_contact, work_permit } =
    privateInfo;

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">✏️ Update Private Info</h3>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Education */}
            <div>
              <h4 className="font-semibold mb-2">Education</h4>
              <input
                type="text"
                value={education?.certificate_level || ""}
                onChange={(e) =>
                  handleChange("education", "certificate_level", e.target.value)
                }
                placeholder="Certificate Level"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                value={education?.field_of_study || ""}
                onChange={(e) =>
                  handleChange("education", "field_of_study", e.target.value)
                }
                placeholder="Field of Study"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                value={education?.school || ""}
                onChange={(e) => handleChange("education", "school", e.target.value)}
                placeholder="School"
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Emergency */}
            <div>
              <h4 className="font-semibold mb-2">Emergency Contact</h4>
              <input
                type="text"
                value={emergency?.contact_name || ""}
                onChange={(e) =>
                  handleChange("emergency", "contact_name", e.target.value)
                }
                placeholder="Contact Name"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                value={emergency?.contact_phone || ""}
                onChange={(e) =>
                  handleChange("emergency", "contact_phone", e.target.value)
                }
                placeholder="Contact Phone"
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Family Status */}
            <div>
              <h4 className="font-semibold mb-2">Family Status</h4>
              <input
                type="text"
                value={family_status?.marital_status || ""}
                onChange={(e) =>
                  handleChange("family_status", "marital_status", e.target.value)
                }
                placeholder="Marital Status"
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                value={family_status?.dependent_children || 0}
                onChange={(e) =>
                  handleChange(
                    "family_status",
                    "dependent_children",
                    Number(e.target.value)
                  )
                }
                placeholder="Dependent Children"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                value={family_status?.spouse_name || ""}
                onChange={(e) =>
                  handleChange("family_status", "spouse_name", e.target.value)
                }
                placeholder="Spouse Name"
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={
                  family_status?.spouse_birthday
                    ? new Date(family_status.spouse_birthday)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange("family_status", "spouse_birthday", e.target.value)
                }
                placeholder="Spouse Birthday"
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Private Contact */}
            <div>
              <h4 className="font-semibold mb-2">Private Contact</h4>
              {[
                "street",
                "city",
                "state",
                "zip",
                "country",
                "private_email",
                "private_phone",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  value={private_contact?.[field as keyof PrivateContact] || ""}
                  onChange={(e) =>
                    handleChange("private_contact", field, e.target.value)
                  }
                  placeholder={field.replace("_", " ").toUpperCase()}
                  className="border p-2 rounded w-full"
                />
              ))}
            </div>

            {/* Work Permit */}
            <div>
              <h4 className="font-semibold mb-2">Work Permit</h4>
              <input
                type="text"
                value={work_permit?.visa_no || ""}
                onChange={(e) => handleChange("work_permit", "visa_no", e.target.value)}
                placeholder="Visa No"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                value={work_permit?.work_permit || ""}
                onChange={(e) =>
                  handleChange("work_permit", "work_permit", e.target.value)
                }
                placeholder="Work Permit"
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={
                  work_permit?.permit_expiration
                    ? new Date(work_permit.permit_expiration).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange("work_permit", "permit_expiration", e.target.value)
                }
                placeholder="Permit Expiration"
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={
                  work_permit?.visa_expiration
                    ? new Date(work_permit.visa_expiration).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange("work_permit", "visa_expiration", e.target.value)
                }
                placeholder="Visa Expiration"
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
                  </div>

        {/* Update Button */}
        <Button
          onClick={handleUpdate}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating Info..." : "Update Private Info"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpdatePrivateInfoTab;

