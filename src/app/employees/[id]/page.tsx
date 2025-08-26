import EmployeeGeneral from "@/components/EmployeeGeneral"; // adjust path based on where General.tsx is

export default function EmployeeDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    return (
        <div >
            
            <EmployeeGeneral /> {/* <-- Use your General component here */}
        </div>
    );
}
