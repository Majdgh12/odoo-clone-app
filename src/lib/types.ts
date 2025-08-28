// types.ts - TypeScript interfaces for Employee Management System

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

export interface GeneralInfo {
  full_name: string;
  job_position: string;
  work_email: string;
  work_phone: string;
  work_mobile: string;
  tags: string[];
  company: string;
  department: string;
  manager: Manager;
  coach: Coach;
  image: string;
  status: "online" | "offline";
}

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

export interface SkillLevel {
  level: string;
  percentage: number;
}

export interface Language {
  language_name: string;
  skill_level: SkillLevel;
}

export interface MarketingSkill {
  level: string;
  percentage: number;
}

export interface Marketing {
  communication: MarketingSkill;
  public_speaking: MarketingSkill;
}

export interface ProgrammingLanguage {
  name: string;
  level: string;
  percentage: number;
}

export interface Skills {
  language: Language[];
  marketing: Marketing;
  programming_languages: ProgrammingLanguage[];
}

export interface GeneralResume {
  resume: Resume;
  skills: Skills;
}

export interface Approvers {
  time_off: string;
  timesheet: string;
}

export interface Schedule {
  working_hours: string;
  timezone: string;
}

export interface Planning {
  roles: string[];
  default_roles: string[];
}

export interface WorkInfo {
  work_address: string;
  work_location: string;
  approvers: Approvers;
  schedule: Schedule;
  planning: Planning;
}

export interface PrivateAddress {
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PrivateContact {
  private_address: PrivateAddress;
  private_email: string;
  private_phone: string;
  home_work_distance: string;
  private_car_plate: string;
}

export interface Emergency {
  contact_name: string;
  contact_phone: string;
}

export interface FamilyStatus {
  marital_status: string;
  spouse_complete_name: string;
  spouse_birthday: string;
  number_of_dependent_children: number;
}

export interface EducationInfo {
  certificate_level: string;
  field_of_study: string;
  school: string;
}

export interface WorkPermit {
  visa_no: string;
  work_permit: string;
  visa_expiration_no: string;
  work_permit_expiration_date: string;
}

export interface PrivateInfo {
  private_contact: PrivateContact;
  emergency: Emergency;
  family_status: FamilyStatus;
  education: EducationInfo;
  work_permit: WorkPermit;
}

export interface Status {
  employee_type: string;
  related_user: string;
}

export interface ApplicationSettings {
  hourly_cost: number;
}

export interface AttendancePointOfSale {
  pin_code: string;
  badge_id: string;
}

export interface Settings {
  status: Status;
  application_settings: ApplicationSettings;
  attendance_point_of_sale: AttendancePointOfSale;
}

export interface User {
  general_info: GeneralInfo;
  general_resume: GeneralResume;
  work_info: WorkInfo;
  private_info: PrivateInfo;
  settings: Settings;
}

export interface Employee {
  id: number;
  user: User;
}

// Utility types for functions
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