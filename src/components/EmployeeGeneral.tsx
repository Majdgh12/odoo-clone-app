"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEmployees, getEmployeeById } from '../lib/getEmployees';
import type { Employee } from '../lib/types';
import ResumeTab from './EmployeeNotebook/ResumeTab';
import WorkInfoTab from './EmployeeNotebook/WorkInfoTab';
import PrivateInfoTab from './EmployeeNotebook/PrivateInfoTab';
import SettingsTab from './EmployeeNotebook/SettingsTab';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EmployeeGeneral: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('resume');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const employees = getEmployees();
        setAllEmployees(employees);

        if (params.id) {
            const emp = getEmployeeById(Number(params.id));
            setEmployee(emp);

            // Find current index
            const index = employees.findIndex(e => e.id === Number(params.id));
            setCurrentIndex(index !== -1 ? index : 0);
        }
        setLoading(false);
    }, [params.id]);

    const navigateToEmployee = (direction: 'prev' | 'next') => {
        let newIndex;
        if (direction === 'next') {
            newIndex = currentIndex < allEmployees.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : allEmployees.length - 1;
        }

        const newEmployeeId = allEmployees[newIndex].id;
        router.push(`/employees/${newEmployeeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading employee details...</div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
                    <p className="text-gray-600">The employee with this ID does not exist.</p>
                </div>
            </div>
        );
    }

    const { general_info } = employee.user;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Home Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">Home</span>
                    </button>

                    {/* Pagination in Center */}
                    <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-4 py-2">
                        <button
                            onClick={() => navigateToEmployee('prev')}
                            className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={allEmployees.length <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-sm text-gray-700 font-medium">
                            {currentIndex + 1} / {allEmployees.length}
                        </span>

                        <button
                            onClick={() => navigateToEmployee('next')}
                            className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={allEmployees.length <= 1}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right side spacer for balance */}
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section - General Info */}
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-start justify-between">

                            {/* Left Side - Employee Info */}
                            <div className="flex-1">
                                <div className="flex items-center mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mr-3">
                                        {general_info.full_name}
                                    </h1>
                                    <span className="text-blue-500 text-xl">🔗</span>
                                </div>

                                <p className="text-lg text-gray-600 mb-8">{general_info.job_position}</p>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">

                                    {/* Left Column */}
                                    <div className="space-y-6">

                                        {/* Work Email */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Work Email <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.work_email}
                                            </span>
                                        </div>

                                        {/* Work Phone */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Work Phone <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.work_phone}
                                            </span>
                                        </div>

                                        {/* Work Mobile */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Work Mobile <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.work_mobile || '-'}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Tags <span className="text-blue-500">?</span>
                                            </span>
                                            <div className="ml-4 flex flex-wrap gap-1">
                                                {general_info.tags && general_info.tags.length > 0 ? (
                                                    general_info.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">Tags</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Company <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.company}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">

                                        {/* Department */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Department <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.department}
                                            </span>
                                        </div>

                                        {/* Job Position */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Job Position <span className="text-blue-500">?</span>
                                            </span>
                                            <span className="text-sm text-gray-900 ml-4">
                                                {general_info.job_position}
                                            </span>
                                        </div>

                                        {/* Manager */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Manager <span className="text-blue-500">?</span>
                                            </span>
                                            <div className="ml-4 flex items-center">
                                                <img
                                                    src={general_info.manager?.image}
                                                    alt={general_info.manager?.name}
                                                    className="w-6 h-6 rounded-full mr-2"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/24x24.png?text=👤';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {general_info.manager?.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Coach */}
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                                                Coach <span className="text-blue-500">?</span>
                                            </span>
                                            <div className="ml-4 flex items-center">
                                                <img
                                                    src={general_info.coach?.image}
                                                    alt={general_info.coach?.name}
                                                    className="w-6 h-6 rounded-full mr-2"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/24x24.png?text=👤';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {general_info.coach?.name}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Employee Photo */}
                            <div className="ml-8 flex-shrink-0">
                                <img
                                    src={general_info.image}
                                    alt={general_info.full_name}
                                    className="w-32 h-40 rounded-lg object-cover border border-gray-200"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/128x160.png?text=No+Photo';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notebook Tabs - Now Integrated */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8">
                            {[
                                { id: 'resume', label: 'Resume' },
                                { id: 'work', label: 'Work Information' },
                                { id: 'private', label: 'Private Information' },
                                { id: 'settings', label: 'Settings' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content - Now Part of Same Card */}
                    <div className="p-8">
                        {activeTab === 'resume' && (
                            <ResumeTab employee={employee} />
                        )}

                        {activeTab === 'work' && (
                            <WorkInfoTab employee={employee} />
                        )}

                        {activeTab === 'private' && (
                            <PrivateInfoTab employee={employee} />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab employee={employee} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeGeneral;