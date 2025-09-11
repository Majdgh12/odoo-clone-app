"use client";

import React from 'react';
import type { Employee } from '../../lib/types';

interface SettingsTabProps {
    employee: Employee;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ employee }) => {
    const settings = employee.user?.settings ?? {};

    const status = settings.status ?? {};
    const application_settings = settings.application_settings ?? {};
    const attendance_point_of_sale = settings.attendance_point_of_sale ?? {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-8">

                {/* Status */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">STATUS</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                Employee Type <span className="text-blue-500">?</span>
                            </span>
                            <span className="text-sm text-gray-900 ml-4">{status.employee_type ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Related User <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{status.related_user ?? '-'}</span>
                            </div>
                            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                                Create User
                            </button>
                        </div>
                    </div>
                </div>

                {/* Application Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">APPLICATION SETTINGS</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                Hourly Cost <span className="text-blue-500">?</span>
                            </span>
                            <div className="ml-4 flex items-center">
                                <span className="text-sm text-gray-900">{application_settings.hourly_cost ?? '0'}.00</span>
                                <span className="text-sm text-gray-500 ml-2">J.J</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">

                {/* Attendance/Point of Sale */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ATTENDANCE/POINT OF SALE</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                PIN Code <span className="text-blue-500">?</span>
                            </span>
                            <span className="text-sm text-gray-900 ml-4">{attendance_point_of_sale.pin_code ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Badge ID <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{attendance_point_of_sale.badge_id ?? '-'}</span>
                            </div>
                            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
