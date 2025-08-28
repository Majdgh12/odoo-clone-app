"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Building2, Users2, ChevronRight } from 'lucide-react';
import {
    getEmployees,
    getDepartments,
    filterEmployees
} from '../../lib/getEmployees';
import type { Employee } from '@/lib/types';

interface SidebarProps {
    onFilterChange: (filteredEmployees: Employee[]) => void;
    selectedFilters: {
        company: string;
        department: string;
    };
    onFilterUpdate: (filterType: 'company' | 'department', value: string) => void;
    children?: React.ReactNode; // i add this 
}

const Sidebar: React.FC<SidebarProps> = ({
    onFilterChange,
    selectedFilters,
    onFilterUpdate,
    children
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [companies, setCompanies] = useState<string[]>([]);
    const [counts, setCounts] = useState({
        total: 0,
        byDepartment: {} as Record<string, number>,
        byCompany: {} as Record<string, number>
    });

    // Load data when component mounts
    useEffect(() => {
        const employees = getEmployees();
        const depts = getDepartments();

        // Get unique companies
        const uniqueCompanies = employees
            .map(emp => emp.user.general_info.company)
            .filter(Boolean)
            .filter((company, index, arr) => arr.indexOf(company) === index)
            .sort();

        setAllEmployees(employees);
        setDepartments(depts);
        setCompanies(uniqueCompanies);

        // Calculate counts
        const departmentCounts: Record<string, number> = {};
        const companyCounts: Record<string, number> = {};

        employees.forEach(emp => {
            const dept = emp.user.general_info.department;
            const company = emp.user.general_info.company;

            if (dept) {
                departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
            }
            if (company) {
                companyCounts[company] = (companyCounts[company] || 0) + 1;
            }
        });

        setCounts({
            total: employees.length,
            byDepartment: departmentCounts,
            byCompany: companyCounts
        });

        // Initial filter (show all employees)
        onFilterChange(employees);
    }, []);

    // Handle filter changes
    useEffect(() => {
        let filteredEmployees = allEmployees;

        // Apply filters
        const filters: any = {};
        if (selectedFilters.department && selectedFilters.department !== 'all') {
            filters.department = selectedFilters.department;
        }
        if (selectedFilters.company && selectedFilters.company !== 'all') {
            filteredEmployees = filteredEmployees.filter(emp =>
                emp.user.general_info.company?.toLowerCase() === selectedFilters.company.toLowerCase()
            );
        }

        if (Object.keys(filters).length > 0) {
            filteredEmployees = filterEmployees(filters);
        }

        onFilterChange(filteredEmployees);
    }, [selectedFilters, allEmployees]);

    const handleCompanyFilter = (company: string) => {
        onFilterUpdate('company', company);
    };

    const handleDepartmentFilter = (department: string) => {
        onFilterUpdate('department', department);
    };

    const getFilteredCount = (filterType: 'company' | 'department', value: string) => {
        if (value === 'all') return counts.total;

        if (filterType === 'company') {
            return counts.byCompany[value] || 0;
        } else {
            return counts.byDepartment[value] || 0;
        }
    };

    return (
        <div className={`t-16 h-screen overflow-hidden bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}   border-r border-gray-300 pt-16` }>
            {/* Header with collapse button */}
               <div className='flex justify-end p-2 mb-0'>
               <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className={`w-5 h-5 text-black transition-transform ${isCollapsed ? 'rotate-180' : ''} `} />
                </button>     
               </div>

            {!isCollapsed && (
                <div className="p-2 space-y-0">
                    {/* COMPANY Section */}
                    <div>
                        <div className="space-y-1">
                            {/* All Companies - commented out sections remain commented */}
                        </div>
                    </div>

                    {/* DEPARTMENT Section */}
                    <div>
                        <div className="flex items-center mb-3">
                            <Users2 className="w-5 h-5 text-[#65435c] mr-2" />
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-black">DEPARTMENT</h3>
                        </div>

                        <div className="space-y-1">
                            {/* All Departments */}
                            <button
                                onClick={() => handleDepartmentFilter('all')}
                                className={`w-full text-left cursor-pointer px-3  rounded-s-sm  ${selectedFilters.department === 'all' || !selectedFilters.department
                                        ? 'bg-[#007c7415] '
                                        : ' hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className='px-2 py-1.5 font-semibold text-black'>All</span>
                                    <span className="bg-gray-200 text-black px-2 py-1 rounded-full text-xs font-medium">
                                        {counts.total}
                                    </span>
                                </div>
                            </button>

                            {/* Individual Departments */}
                            {departments.map((department) => (
                                <button
                                    key={department}
                                    onClick={() => handleDepartmentFilter(department)}
                                    className={`w-full text-left mt-0.5 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedFilters.department === department
                                            ? 'bg-teal-50 text-black border font-medium'
                                            : 'text-black hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ChevronRight className="w-3 h-3 mr-1 text-black" />
                                            <span className="text-black">{department}</span>
                                        </div>
                                        <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                                            {getFilteredCount('department', department)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {children && ( // and i add this
                <div className="block lg:hidden flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            )}
            {/* Collapsed state icons */}
            {isCollapsed && (
                <div className="p-2 space-y-4 mt-4">
                    <div className="flex justify-center">
                        <Users2 className="w-6 h-6 text-[#65435c]" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;