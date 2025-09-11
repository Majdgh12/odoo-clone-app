// app/employees/[id]/page.tsx
import EmployeeGeneral from "@/components/EmployeeGeneral";

export default async function EmployeeDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <EmployeeGeneral employeeId={String(id)} />
    </div>
  );
}
