"use client";

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [activeFilter, setActiveFilter] = useState('My Team');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  // const removeFilter = () => {
  //   setActiveFilter('');
  // };

  return (
    <div className="flex items-center space-x-2">
      {/* Search Input */}
      <div className="relative flex-1 w-[500px] justify-center mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="center w-full px-8  py-1.5 border border-gray-300 rounded-sm focus:ring-1 border-rad focus:ring-[#07ab98] focus:border-transparent outline-none text-sm"
        />
      </div>

      {/* Active Filter Tag */}
      {/* {activeFilter && (
        <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
          <span className="mr-2">{activeFilter}</span>
          <button onClick={removeFilter} className="hover:bg-purple-200 rounded-full p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )} */}
    </div>
  );
};

export default SearchBar;