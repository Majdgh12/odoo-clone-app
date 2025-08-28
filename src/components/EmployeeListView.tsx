"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import type { Employee } from "@/lib/types";

interface EmployeeListViewProps {
    employees: Employee[];
}

function isRemoteUrl(src: string) {
    try {
        const url = new URL(src);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

const EmployeeListView: React.FC<EmployeeListViewProps> = ({ employees }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-900">
                    <div className="col-span-1">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                    <div className="col-span-2">Employee Name</div>
                    <div className="col-span-1">Work Phone</div>
                    <div className="col-span-2">Work Email</div>
                    <div className="col-span-1">Company</div>
                    <div className="col-span-2">Department</div>
                    <div className="col-span-2">Job Position</div>
                    <div className="col-span-1">Manager</div>
                </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
                {employees.map((employee) => {
                    const info = employee.user.general_info;
                    const useFallback = isRemoteUrl(info.image);

                    return (
                        <Link href={`/employees/${employee.id}`} key={employee.id}>
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                {/* Checkbox */}
                                <div className="col-span-1 flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* Employee Name with Photo */}
                                <div className="col-span-2 flex items-center space-x-3">
                                    <div className="relative w-8 h-8 rounded-full flex-shrink-0">
                                        {useFallback ? (
                                            <img
                                                src={info.image}
                                                alt={info.full_name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <Image
                                                src={info.image}
                                                alt={info.full_name}
                                                fill
                                                className="object-cover rounded-full"
                                            />
                                        )}
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${info.status === "online" ? "bg-green-400" : "bg-gray-400"
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{info.full_name}</div>
                                    </div>
                                </div>

                                {/* Work Phone */}
                                <div className="col-span-1 flex items-center">
                                    <span className="text-sm text-gray-600">{info.work_phone}</span>
                                </div>

                                {/* Work Email */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-600 truncate">{info.work_email}</span>
                                </div>

                                {/* Company */}
                                <div className="col-span-1 flex items-center">
                                    <span className="text-sm text-gray-600 truncate">{info.company || 'N/A'}</span>
                                </div>

                                {/* Department */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-600">{info.department}</span>
                                </div>

                                {/* Job Position */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-600">{info.job_position}</span>
                                </div>

                                {/* Manager */}
                                <div className="col-span-1 flex items-center">
                                    {info.manager && (
                                        <div className="flex items-center space-x-2">
                                            <div className="relative w-6 h-6 rounded-full flex-shrink-0">
                                                {isRemoteUrl(info.manager.image) ? (
                                                    <img
                                                        src={info.manager.image}
                                                        alt={info.manager.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={info.manager.image}
                                                        alt={info.manager.name}
                                                        fill
                                                        className="object-cover rounded-full"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-600 truncate">{info.manager.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default EmployeeListView;