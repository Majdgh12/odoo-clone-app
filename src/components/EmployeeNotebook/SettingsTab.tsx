"use client";

import React from "react";
import type { Employee } from "../../lib/types";

interface SettingsTabProps {
    employee: Employee;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ employee }) => {
    const settings = employee.user?.settings ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderObject = (obj: any) => {
        if (!obj || Object.keys(obj).length === 0) return <p className="text-gray-500">No data</p>;

        return (
            <div className="space-y-4">
                {Object.entries(obj).map(([key, value]) => {
                    if (value && typeof value === "object" && !Array.isArray(value)) {
                        return (
                            <div key={key} className="ml-4">
                                <h4 className="text-gray-700 font-medium capitalize">{formatLabel(key)}</h4>
                                {renderObject(value)}
                            </div>
                        );
                    } else if (Array.isArray(value)) {
                        return (
                            <div key={key} className="ml-4">
                                <h4 className="text-gray-700 font-medium capitalize">{formatLabel(key)}</h4>
                                <ul className="list-disc list-inside ml-2">
                                    {value.map((v, idx) => (
                                        <li key={idx}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    } else {
                        return (
                            <div key={key} className="flex items-start">
                                <span className="text-sm text-gray-500 w-40 flex-shrink-0 mt-1 capitalize">{formatLabel(key)}</span>
                                <span className="text-sm text-gray-900 ml-4">
                                    {value === null || value === undefined
                                        ? "-"
                                        : typeof value === "object"
                                            ? JSON.stringify(value)
                                            : String(value)}
                                </span>
                            </div>
                        );
                    }
                })}
            </div>
        );
    };

    const formatLabel = (label: string) => {
        return label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SETTINGS</h3>
            {renderObject(settings)}
        </div>
    );
};

export default SettingsTab;
