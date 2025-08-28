"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  // Limit items per page to maximum 9
  const effectiveItemsPerPage = Math.min(itemsPerPage, 9);
  const startItem = (currentPage - 1) * effectiveItemsPerPage + 1;
  const endItem = Math.min(currentPage * effectiveItemsPerPage, totalItems);

  return (
    <div className="flex items-center space-x-4 select-none">
      {/* Results Count */}
      <span className="text-sm text-black font-medium">
        {startItem}-{endItem} / {totalItems}
      </span>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-3 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-black" />
        </button>
                
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-3 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;