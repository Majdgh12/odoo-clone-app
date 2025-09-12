// app/employees/[id]/page.tsx
import EmployeeGeneral from "@/components/EmployeeGeneral";
import { getEmployees, getEmployeeById, initializeEmployees } from "@/lib/getEmployees";
import { init } from "next/dist/compiled/webpack/webpack";

export default async function EmployeeDetailsPage({
  params,
}: {
  params: { id: string };
}) {
await initializeEmployees();
  const employees = await getEmployees();
  const employee = await getEmployeeById(params.id);

  return (
    <EmployeeGeneral
      employee={employee}
      employees={Array.isArray(employees) ? employees : [employees]}
    />
  );
}
