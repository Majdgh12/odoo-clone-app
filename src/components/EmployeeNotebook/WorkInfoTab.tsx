"use client";

import React from "react";
import type { Employee, WorkInfo } from "../../lib/types";

interface WorkInfoTabProps {
  employee: Employee;
}

const WorkInfoTab: React.FC<WorkInfoTabProps> = ({ employee }) => {
  const work_info: WorkInfo | undefined = employee.user?.work_info;
  const settings = employee.user?.settings;

  if (!work_info) {
    return <p className="text-gray-500">No work information available.</p>;
  }

  // Build the dynamic hierarchy
  const buildHierarchy = () => {
    const hierarchy: { name: string; title: string }[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = employee.user;

    // Push the employee itself
    hierarchy.unshift({ name: current.full_name, title: current.job_position });

    // Traverse upwards
    while (current.manager) {
      hierarchy.unshift({ name: current.manager.full_name, title: current.manager.job_position });
      current = current.manager;
    }

    // Ensure Admin/CEO is at top
    if (hierarchy[0].title!== "admin" && hierarchy[0].title !== "ceo") {
      hierarchy.unshift({ name: "Admin/CEO", title: "Admin/CEO" });
    }

    return hierarchy;
  };

  const hierarchy = buildHierarchy();

  return (
    <div className="space-y-8">
      {/* Work Info Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfoRow label="Work Address" value={work_info.work_address} />
          <InfoRow label="Work Location" value={work_info.work_location} />
          <InfoRow label="Working Hours" value={work_info.working_hours} />
          <InfoRow label="Timezone" value={work_info.timezone} />
          <InfoRow label="Time Off Approver" value={work_info.approver_timeoff_id} />
          <InfoRow label="Timesheet Approver" value={work_info.approver_timesheet_id} />
          <InfoRow label="Badge ID" value={settings?.badge_id} />
          <InfoRow label="Employee Type" value={settings?.employee_type} />
          <InfoRow label="Hourly Cost" value={settings?.hourly_cost?.toString()} />
          <InfoRow label="POS Pin Code" value={settings?.pos_pin_code} />
          <InfoRow label="Related User" value={settings?.related_user} />
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
