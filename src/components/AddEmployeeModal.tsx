// src/components/AddEmployeeModal.tsx
"use client";
import React from "react";
import AddEmployee from "@/components/dashboard_components/AddEmployee";

export default function AddEmployeeModal({
    open,
    onClose,
    onSuccess,
    departments,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess?: (createdEmployee?: any) => void;
    departments?: any[];
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl p-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Add Employee</h3>
                        <button onClick={onClose} className="text-gray-600">✕</button>
                    </div>

                    <AddEmployee departments={departments} onSuccess={onSuccess} onClose={onClose} />
                </div>
            </div>
        </div>
    );
}

