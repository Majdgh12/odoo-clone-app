// app/employees/[id]/page.tsx

import EmployeeGeneral from "@/components/EmployeeGeneral";

export default function EmployeeDetailsPage({
  params,
}: {
  params: { id: string };
}) {

  return (
    <div>

      <EmployeeGeneral />
    </div>
  );
}
