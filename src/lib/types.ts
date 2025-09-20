// types.ts - TypeScript interfaces for Employee Management System
import { ReactNode } from "react";

// Manager & Coach
export interface Manager {
  name: string;
  image: string;
  id: string;
}

export interface Coach {
  name: string;
  id: string;
  image: string;
}

// General Info
export interface GeneralInfo {
  full_name: string;
  job_position: string;
  work_email: string;
  work_phone: string;
  work_mobile: string;
  tags: string[];
  company: string;
  department: string | { id: string; name: string };
  manager?: Manager;
  coach?: Coach;
  image: string;
  status: "online" | "offline";
}

// Experience & Education
export interface Experience {
  date_from: string;
  date_to: string;
  title: string;
  job_description: string;
}

export interface Education {
  title: string;
  from_date: string;
  to_date: string;
}

export interface Resume {
  experience: Experience[];
  education: Education[];
}

// Skills
export interface SkillLevel {
  level: string;
  percentage: number;
}

export interface Language {
  language_name: string;
  level: string; // replaced ReactNode with string for consistency
  percentage: number;
}

export interface ProgrammingLanguage {
  name: string;
  level: string;
  percentage: number;
}

export interface Skills {
  other_skills: Array<{ skill_name: string; level: string; percentage: number }>;
  language: Language[];
  programming_languages: ProgrammingLanguage[];
}

// General Resume
export interface GeneralResume {
  resume: Resume;
  skills: Skills;
}

// Work Info
export interface WorkInfo {
  work_address: string;
  work_location: string;
  working_hours: string;
  timezone: string;
  approver_timeoff_id?: string;
  approver_timesheet_id?: string;
  employee_id: string;
}

// Private Info
export interface PrivateAddress {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface PrivateContact {
  zip?: string;
  country?: string;
  city?: string;
  state?: string;
  street?: string;
  private_address?: PrivateAddress;
  private_email?: string;
  private_phone?: string;
  home_work_distance?: string;
  private_car_plate?: string;
}

export interface Emergency {
  contact_name?: string;
  contact_phone?: string;
}

export interface FamilyStatus {
  spouse_name?: string;
  dependent_children?: string;
  marital_status?: string;
  spouse_complete_name?: string;
  spouse_birthday?: string;
  number_of_dependent_children?: number;
}

export interface EducationInfo {
  certificate_level?: string;
  field_of_study?: string;
  school?: string;
}

export interface WorkPermit {
  permit_expiration?: string;
  visa_expiration?: string;
  visa_no?: string;
  work_permit?: string;
  visa_expiration_no?: string;
  work_permit_expiration_date?: string;
}

export interface PrivateInfo {
  private_contact?: PrivateContact;
  emergency?: Emergency;
  family_status?: FamilyStatus;
  education?: EducationInfo;
  work_permit?: WorkPermit;
}

// Settings
export interface Status {
  employee_type?: string;
  related_user?: string;
}

export interface ApplicationSettings {
  hourly_cost?: number;
}

export interface AttendancePointOfSale {
  pin_code?: string;
  badge_id?: string;
}

export interface Settings {
  status?: Status;
  application_settings?: ApplicationSettings;
  attendance_point_of_sale?: AttendancePointOfSale;
}

// User & Employee
export interface User {
  general_info?: GeneralInfo;
  general_resume?: GeneralResume;
  work_info?: WorkInfo;
  private_info?: PrivateInfo;
  settings?: Settings;
  role?: string;
  token?: string;
  employeeId?: string;  
}
interface Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    employeeId?: string; // 👈 add here
  };
  accessToken?: string;
}

export interface Employee {
  id: number | string;
  _id?: string;
  user: User;
}

// Utility types
export interface PaginationResult {
  employees: Employee[];
  totalPages: number;
  currentPage: number;
  totalEmployees: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Stats {
  total: number;
  departments: Record<string, number>;
  positions: Record<string, number>;
  totalDepartments: number;
  totalPositions: number;
}

export interface FilterOptions {
  department?: string;
  position?: string;
  search?: string;
  tags?: string[];
}
