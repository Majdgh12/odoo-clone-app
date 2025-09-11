// lib/getEmployees.ts - Simple way to use JSON data

 // path to route.ts


import type { Employee,  FilterOptions } from "@/lib/types";


let employeeArray: Employee[] = [];

export const initializeEmployees = async (): Promise<Employee[]> => {
  try {
    const res = await fetch("http://localhost:5000/api/employees"); // backend URL
    if (!res.ok) {
      throw new Error("Failed to fetch employees");
    }

    const data: Employee[] = await res.json();
    employeeArray = Array.isArray(data) ? data : [data]; // ensure it's an array
    console.log("Employees fetched:", employeeArray.length);
    return employeeArray;
  } catch (err) {
    console.error("Error fetching employees:", err);
    employeeArray = [];
    return [];
  }
};

export const getEmployees = (): Employee[] => employeeArray;

/**
 * Get employee by ID
 * @param {number} id - Employee ID
 * @returns {Employee | null} Employee object or null if not found
 */

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const emp = employeeArray.find(
    (e) => e.id === id || (e as any)._id === id
  );
  return emp || null;
}






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
        (typeof info.department === "string"
          ? info.department.toLowerCase().includes(term)
          : info.department?.name?.toLowerCase().includes(term)) ||
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
