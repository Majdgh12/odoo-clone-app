"use client";

import React from "react";
import type { Employee, WorkInfo } from "../../lib/types";

interface WorkInfoTabProps {
  employee: Employee;
}

const WorkInfoTab: React.FC<WorkInfoTabProps> = ({ employee }) => {
  const work_info: WorkInfo | undefined = employee.user?.work_info;

  if (!work_info) {
    return <p className="text-gray-500">No work information available.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Work Info */}
      <div className="space-y-8">
        {/* Work Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
          <div className="space-y-4">
            <InfoRow label="Work Address" value={work_info.work_address} />
            <InfoRow label="Work Location" value={work_info.work_location} />
            <InfoRow label="Working Hours" value={work_info.working_hours} />
            <InfoRow label="Timezone" value={work_info.timezone} />
          </div>
        </div>

        {/* Approvers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approvers</h3>
          <div className="space-y-4">
            <InfoRow label="Time Off Approver" value={work_info.approver_timeoff_id} />
            <InfoRow label="Timesheet Approver" value={work_info.approver_timesheet_id} />
          </div>
        </div>
      </div>

      {/* Right Side - Employee ID */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Employee Reference</h3>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Employee ID: </span>
            {work_info.employee_id}
          </p>
        </div>
      </div>
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
