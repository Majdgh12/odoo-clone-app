"use client";

import React from 'react';
import type { Employee } from '../../lib/types';

interface PrivateInfoTabProps {
    employee: Employee;
}

const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ employee }) => {
    const { private_info } = employee.user;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-8">

                {/* Private Contact */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">PRIVATE CONTACT</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Private Address <span className="text-blue-500">?</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm text-gray-900">{private_info.private_contact.private_address.street}</p>
                                    {private_info.private_contact.private_address.street2 && (
                                        <p className="text-sm text-gray-900">{private_info.private_contact.private_address.street2}</p>
                                    )}
                                    <div className="grid grid-cols-3 gap-4">
                                        <p className="text-sm text-gray-900">{private_info.private_contact.private_address.city}</p>
                                        <p className="text-sm text-gray-900">{private_info.private_contact.private_address.state}</p>
                                        <p className="text-sm text-gray-900">{private_info.private_contact.private_address.zip}</p>
                                    </div>
                                    <p className="text-sm text-gray-900">{private_info.private_contact.private_address.country}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Private Email <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.private_contact.private_email}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Private Phone <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.private_contact.private_phone}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Bank Account <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Home-Work Distance <span className="text-blue-500">?</span>
                                </span>
                                <div className="ml-4 flex items-center">
                                    <span className="text-sm text-gray-900">{private_info.private_contact.home_work_distance}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Private Car Plate <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.private_contact.private_car_plate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">EMERGENCY</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Contact Name <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.emergency.contact_name}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Contact Phone <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.emergency.contact_phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Family Status */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">FAMILY STATUS</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Marital Status <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.family_status.marital_status}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Number of Dependent Children <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.family_status.number_of_dependent_children}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">

                {/* Citizenship */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CITIZENSHIP</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Nationality (Country) <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.private_contact.private_address.country}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Identification No <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    SSN No <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Passport No <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Gender <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Date of Birth <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Place of Birth <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Country of Birth <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">EDUCATION</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Certificate Level <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.education.certificate_level}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Field of Study <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.education.field_of_study}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    School <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.education.school}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Permit */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">WORK PERMIT</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Visa No <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.work_permit.visa_no}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Work Permit No <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.work_permit.work_permit}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Visa Expiration Date <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.work_permit.visa_expiration_no}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Work Permit Expiration Date <span className="text-blue-500">?</span>
                                </span>
                                <span className="text-sm text-gray-900 ml-4">{private_info.work_permit.work_permit_expiration_date}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                                    Work Permit <span className="text-blue-500">?</span>
                                </span>
                                <div className="ml-4 flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">Upload your file</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateInfoTab;