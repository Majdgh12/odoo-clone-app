"use client";

import React, { useEffect } from "react";
import type { Employee, PrivateInfo } from "../../lib/types";

interface PrivateInfoTabProps {
    employee: Employee;
}

const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ employee }) => {
    const private_info: PrivateInfo = employee.user?.private_info ?? ({} as PrivateInfo);

    // Debug: Log the entire private_info object
    useEffect(() => {
        console.log("Private info received:", private_info);
    }, [private_info]);

    if (!private_info || Object.keys(private_info).length === 0) {
        return <p className="text-gray-500">No private information available.</p>;
    }

    const { education, emergency, family_status, private_contact, work_permit } = private_info;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
                {/* Education */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">EDUCATION</h3>
                    {education ? (
                        <div className="space-y-2 text-black">
                            <p>Certificate Level: {education.certificate_level ?? "-"}</p>
                            <p>Field of Study: {education.field_of_study ?? "-"}</p>
                            <p>School: {education.school ?? "-"}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No education data available.</p>
                    )}
                </div>

                {/* Emergency */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">EMERGENCY</h3>
                    {emergency ? (
                        <div className="space-y-2 text-black">
                            <p>Contact Name: {emergency.contact_name ?? "-"}</p>
                            <p>Contact Phone: {emergency.contact_phone ?? "-"}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No emergency contact available.</p>
                    )}
                </div>

                {/* Family Status */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">FAMILY STATUS</h3>
                    {family_status ? (
                        <div className="space-y-2 text-black">
                            <p>Marital Status: {family_status.marital_status ?? "-"}</p>
                            <p>Dependent Children: {family_status.dependent_children ?? "-"}</p>
                            <p>Spouse Name: {family_status.spouse_name ?? "-"}</p>
                            <p>
                                Spouse Birthday:{" "}
                                {family_status.spouse_birthday
                                    ? new Date(family_status.spouse_birthday).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No family status data available.</p>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                {/* Private Contact */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">PRIVATE CONTACT</h3>
                    {private_contact ? (
                        <div className="space-y-2 text-black">
                            <p>Street: {private_contact.street ?? "-"}</p>
                            <p>City: {private_contact.city ?? "-"}</p>
                            <p>State: {private_contact.state ?? "-"}</p>
                            <p>ZIP: {private_contact.zip ?? "-"}</p>
                            <p>Country: {private_contact.country ?? "-"}</p>
                            <p>Email: {private_contact.private_email ?? "-"}</p>
                            <p>Phone: {private_contact.private_phone ?? "-"}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No private contact data available.</p>
                    )}
                </div>

                {/* Work Permit */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">WORK PERMIT</h3>
                    {work_permit ? (
                        <div className="space-y-2 text-black">
                            <p>Visa No: {work_permit.visa_no ?? "-"}</p>
                            <p>Work Permit: {work_permit.work_permit ?? "-"}</p>
                            <p>
                                Permit Expiration:{" "}
                                {work_permit.permit_expiration
                                    ? new Date(work_permit.permit_expiration).toLocaleDateString()
                                    : "-"}
                            </p>
                            <p>
                                Visa Expiration:{" "}
                                {work_permit.visa_expiration
                                    ? new Date(work_permit.visa_expiration).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No work permit data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateInfoTab;
