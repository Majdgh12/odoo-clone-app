"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Building2, Users2, ChevronRight } from 'lucide-react';
import {
    getEmployees,
    getDepartments,
    filterEmployees
} from '../lib/getEmployees';
import type { Employee } from '@/lib/types';

interface SidebarProps {
    onFilterChange: (filteredEmployees: Employee[]) => void;
    selectedFilters: {
        company: string;
        department: string;
    };
    onFilterUpdate: (filterType: 'company' | 'department', value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    onFilterChange,
    selectedFilters,
    onFilterUpdate
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
        <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'} h-screen border-r border-gray-200`}>
            {/* Header with collapse button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isCollapsed && <h2 className="text-lg font-semibold text-gray-800">Filters</h2>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {!isCollapsed && (
                <div className="p-4 space-y-6">
                    {/* COMPANY Section */}
                    <div>
                        <div className="flex items-center mb-3">
                            <Building2 className="w-5 h-5 text-purple-600 mr-2" />
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">COMPANY</h3>
                        </div>

                        <div className="space-y-1">
                            {/* All Companies */}
                            <button
                                onClick={() => handleCompanyFilter('all')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedFilters.company === 'all' || !selectedFilters.company
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>All</span>
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {counts.total}
                                    </span>
                                </div>
                            </button>

                            {/* Individual Companies */}
                            {companies.map((company) => (
                                <button
                                    key={company}
                                    onClick={() => handleCompanyFilter(company)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedFilters.company === company
                                            ? 'bg-teal-50 text-teal-700 border border-teal-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate">
                                            {company.length > 20 ? `${company.substring(0, 17)}...` : company}
                                        </span>
                                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                                            {getFilteredCount('company', company)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DEPARTMENT Section */}
                    <div>
                        <div className="flex items-center mb-3">
                            <Users2 className="w-5 h-5 text-purple-600 mr-2" />
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">DEPARTMENT</h3>
                        </div>

                        <div className="space-y-1">
                            {/* All Departments */}
                            <button
                                onClick={() => handleDepartmentFilter('all')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedFilters.department === 'all' || !selectedFilters.department
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>All</span>
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {counts.total}
                                    </span>
                                </div>
                            </button>

                            {/* Individual Departments */}
                            {departments.map((department) => (
                                <button
                                    key={department}
                                    onClick={() => handleDepartmentFilter(department)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedFilters.department === department
                                            ? 'bg-teal-50 text-teal-700 border border-teal-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ChevronRight className="w-3 h-3 mr-1 text-gray-400" />
                                            <span>{department}</span>
                                        </div>
                                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {getFilteredCount('department', department)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Collapsed state icons */}
            {isCollapsed && (
                <div className="p-2 space-y-4 mt-4">
                    <div className="flex justify-center">
                        <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex justify-center">
                        <Users2 className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;