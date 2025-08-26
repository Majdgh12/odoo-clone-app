"use client";

import React, { useState } from 'react';
import { ChevronDown, Filter, Plus } from 'lucide-react';

interface FilterDropdownProps {
    onFilterChange: (filters: Record<string, any>) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        atWork: false,
        onTimeOff: false,
        myTeam: true,
        myDepartment: false,
        newlyHired: false,
        fixedHours: false,
        flexibleHours: false,
        archived: false
    });

    const handleFilterToggle = (filterKey: string) => {
        const newFilters = {
            ...activeFilters,
            [filterKey]: !activeFilters[filterKey as keyof typeof activeFilters]
        };
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>

                        {/* Filter Options */}
                        <div className="space-y-2">
                            {[
                                { key: 'atWork', label: 'At work' },
                                { key: 'onTimeOff', label: 'On Time Off' },
                                { key: 'myTeam', label: 'My Team' },
                                { key: 'myDepartment', label: 'My Department' },
                                { key: 'newlyHired', label: 'Newly Hired' },
                                { key: 'fixedHours', label: 'Fixed Hours' },
                                { key: 'flexibleHours', label: 'Flexible Hours' },
                                { key: 'archived', label: 'Archived' }
                            ].map((filter) => (
                                <label key={filter.key} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={activeFilters[filter.key as keyof typeof activeFilters]}
                                        onChange={() => handleFilterToggle(filter.key)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{filter.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Add Custom Filter */}
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                            <Plus className="w-4 h-4" />
                            <span>Add Custom Filter</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;