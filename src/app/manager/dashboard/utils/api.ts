// TS api.ts
import { Employee } from "@/lib/types";

export const getDepartments = async () => {
  const res = await fetch("/api/departments?manager=true");
  const data = await res.json();
  return data.map((dept: any) => ({
    ...dept,
    id: dept._id, // Map _id to id to match DepartmentType if needed
    _id: dept._id,
  }));
};

export const getEmployeesByDept = async (departmentId: string): Promise<Employee[]> => {
  const res = await fetch(`/api/employees?departmentId=${departmentId}`);
  const data = await res.json();
  return data.map((emp: any) => ({
    id: emp._id, // Map _id to id to match Employee interface
    _id: emp._id,
    full_name: emp.full_name,
    status: emp.status,
    job_position: emp.job_position,
    work_email: emp.work_email,
    image: emp.image,
    tags: emp.tags,
    company: emp.company,
    department_id: emp.department_id,
    manager_id: emp.manager_id,
    team_lead_id: emp.team_lead_id,
    user: {
      general_info: {
        full_name: emp.full_name,
        job_position: emp.job_position,
        work_email: emp.work_email,
        image: emp.image,
        status: emp.status,
        manager: emp.manager_id
          ? { id: emp.manager_id.toString(), name: "", image: "" }
          : undefined,
      },
    },
  }));
};

export const getTeamLeadersByDept = async (departmentId: string): Promise<Employee[]> => {
  const res = await fetch(`/api/employees?departmentId=${departmentId}&job_position=Team Leader`);
  const data = await res.json();
  return data.map((emp: any) => ({
    id: emp._id, // Map _id to id to match Employee interface
    _id: emp._id,
    full_name: emp.full_name,
    status: emp.status,
    job_position: emp.job_position,
    work_email: emp.work_email,
    image: emp.image,
    tags: emp.tags,
    company: emp.company,
    department_id: emp.department_id,
    manager_id: emp.manager_id,
    team_lead_id: emp.team_lead_id,
    user: {
      general_info: {
        full_name: emp.full_name,
        job_position: emp.job_position,
        work_email: emp.work_email,
        image: emp.image,
        status: emp.status,
        manager: emp.manager_id
          ? { id: emp.manager_id.toString(), name: "", image: "" }
          : undefined,
      },
    },
  }));
};

export const assignTeamLead = async (employeeId: string, teamLeadId: string) => {
  await fetch(`/api/employees/${employeeId}/assign-team-lead`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_lead_id: teamLeadId }),
  });
};