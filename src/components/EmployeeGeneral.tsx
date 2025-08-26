"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getEmployeeById } from '../lib/getEmployees';
import type { Employee } from '../lib/types';

const EmployeeGeneral: React.FC = () => {
    const params = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState('resume');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            const emp = getEmployeeById(Number(params.id));
            setEmployee(emp);
            setLoading(false);
        }
    }, [params.id]);

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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header Section - General Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
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

                {/* Notebook Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'resume' && (
                            <div className="space-y-8">
                                <div className="text-center py-12 text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Resume Content</h3>
                                    <p>Resume information will be displayed here</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'work' && (
                            <div className="space-y-8">
                                <div className="text-center py-12 text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Work Information</h3>
                                    <p>Work-related information will be displayed here</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'private' && (
                            <div className="space-y-8">
                                <div className="text-center py-12 text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Private Information</h3>
                                    <p>Private employee information will be displayed here</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                <div className="text-center py-12 text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Settings</h3>
                                    <p>Employee settings will be displayed here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeGeneral;