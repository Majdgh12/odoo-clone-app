// lib/getEmployees.ts - Simple way to use JSON data
import employeeData from "@/data/employees.json";
import type { Employee, PaginationResult, Stats, FilterOptions } from "@/lib/types";
import { log } from "console";

/**
 * Get all employees
 * @returns {Employee[]} Array of all employee objects
 */
export const getEmployees = (): Employee[] => {
  // If JSON contains single object, wrap in array; if array, return as is
  return Array.isArray(employeeData)
    ? (employeeData as unknown as Employee[])
    : [employeeData as unknown as Employee];
    console.log(getEmployees());

};

/**
 * Get employee by ID
 * @param {number} id - Employee ID
 * @returns {Employee | null} Employee object or null if not found
 */
export const getEmployeeById = (id: number): Employee | null => {
  const employees = getEmployees();
  return (
    employees.find((employee) => employee.id === parseInt(id.toString())) ||
    null
  );
};

/**
 * Search employees by name, position, email, department, or tags
 * @param {string} searchTerm - What to search for
 * @returns {Employee[]} Matching employees
 */
export const searchEmployees = (searchTerm: string): Employee[] => {
  if (!searchTerm.trim()) return getEmployees();
  const employees = getEmployees();
  const term = searchTerm.toLowerCase();

  return employees.filter((employee) => {
    const info = employee.user.general_info;
    return (
      info.full_name?.toLowerCase().includes(term) ||
      info.job_position?.toLowerCase().includes(term) ||
      info.work_email?.toLowerCase().includes(term) ||
      info.department?.toLowerCase().includes(term) ||
      info.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  });
};

/**
 * Filter employees by department
 * @param {string} department - Department name
 * @returns {Employee[]} Employees in that department
 */
export const getEmployeesByDepartment = (department: string): Employee[] => {
  const employees = getEmployees();
  return employees.filter(
    (employee) =>
      employee.user.general_info.department?.toLowerCase() ===
      department.toLowerCase()
  );
};

/**
 * Filter employees by job position
 * @param {string} position - Job position
 * @returns {Employee[]} Employees with that position
 */
export const getEmployeesByPosition = (position: string): Employee[] => {
  const employees = getEmployees();
  return employees.filter(
    (employee) =>
      employee.user.general_info.job_position?.toLowerCase() ===
      position.toLowerCase()
  );
};

/**
 * Filter employees by tags
 * @param {string[]} tags - Array of tags to filter by
 * @returns {Employee[]} Employees that have any of these tags
 */
export const getEmployeesByTags = (tags: string[]): Employee[] => {
  const employees = getEmployees();
  return employees.filter((employee) =>
    tags.some((tag) =>
      employee.user.general_info.tags?.some((empTag) =>
        empTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  );
};

/**
 * Get unique departments from all employees
 * @returns {string[]} List of unique departments
 */
export const getDepartments = (): string[] => {
  const employees = getEmployees();
  const departments = employees
    .map((emp) => emp.user.general_info.department)
    .filter(Boolean) // Remove empty values
    .filter((dept, index, arr) => arr.indexOf(dept) === index); // Remove duplicates

  return departments.sort();
};

/**
 * Get unique job positions from all employees
 * @returns {string[]} List of unique job positions
 */
export const getJobPositions = (): string[] => {
  const employees = getEmployees();
  const positions = employees
    .map((emp) => emp.user.general_info.job_position)
    .filter(Boolean)
    .filter((pos, index, arr) => arr.indexOf(pos) === index);

  return positions.sort();
};

/**
 * Get all unique tags from all employees
 * @returns {string[]} List of all unique tags
 */
export const getAllTags = (): string[] => {
  const employees = getEmployees();
  const allTags = employees
    .flatMap((emp) => emp.user.general_info.tags || [])
    .filter((tag, index, arr) => arr.indexOf(tag) === index);

  return allTags.sort();
};

/**
 * Get employees with pagination
 * @param {number} page - Page number (starts at 1)
 * @param {number} limit - How many per page
 * @returns {PaginationResult} Object with employees and pagination info
 */
export const getEmployeesPage = (
  page: number = 1,
  limit: number = 10
): PaginationResult => {
  const employees = getEmployees();
  const totalEmployees = employees.length;
  const totalPages = Math.ceil(totalEmployees / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    employees: employees.slice(startIndex, endIndex),
    totalPages,
    currentPage: page,
    totalEmployees,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Get basic stats about employees
 * @returns {Stats} Statistics object
 */
export const getEmployeeStats = (): Stats => {
  const employees = getEmployees();

  // Count by department
  const departmentCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    const dept = emp.user.general_info.department;
    if (dept) {
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    }
  });

  // Count by position
  const positionCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    const pos = emp.user.general_info.job_position;
    if (pos) {
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    }
  });

  return {
    total: employees.length,
    departments: departmentCounts,
    positions: positionCounts,
    totalDepartments: Object.keys(departmentCounts).length,
    totalPositions: Object.keys(positionCounts).length,
  };
};

/**
 * Advanced filter - combine multiple filters
 * @param {FilterOptions} filters - Filter options object
 * @returns {Employee[]} Filtered employees
 */
export const filterEmployees = (filters: FilterOptions = {}): Employee[] => {
  let employees = getEmployees();

  // Filter by department
  if (filters.department) {
    employees = employees.filter(
      (emp) =>
        emp.user.general_info.department?.toLowerCase() ===
        filters.department!.toLowerCase()
    );
  }

  // Filter by position
  if (filters.position) {
    employees = employees.filter(
      (emp) =>
        emp.user.general_info.job_position?.toLowerCase() ===
        filters.position!.toLowerCase()
    );
  }

  // Filter by search term
  if (filters.search) {
    const term = filters.search.toLowerCase();
    employees = employees.filter((emp) => {
      const info = emp.user.general_info;
      return (
        info.full_name?.toLowerCase().includes(term) ||
        info.job_position?.toLowerCase().includes(term) ||
        info.work_email?.toLowerCase().includes(term) ||
        info.department?.toLowerCase().includes(term) ||
        info.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    employees = employees.filter((emp) =>
      filters.tags!.some((tag) =>
        emp.user.general_info.tags?.some((empTag) =>
          empTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  return employees;
};
