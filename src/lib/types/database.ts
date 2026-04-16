export type Gender = 'Male' | 'Female';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export type MaintenanceStatus = 'Open' | 'In Progress' | 'Closed';

export interface Proctor {
  id: string;
  full_name: string;
  phone_number: string | null;
  created_at: string;
}

export interface Building {
  id: number;
  name: string;
  proctor_id: string | null;
  type: Gender;
  total_rooms: number;
  created_at: string;
}

export interface Room {
  id: number;
  building_id: number;
  floor: number;
  capacity: number;
  current_occupancy: number;
  is_available: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  gender: Gender;
  year_of_study: number;
  program: string | null;
  building_id: number | null;
  room_id: number | null;
  created_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  preferred_building_id: number | null;
  preferred_floor: number | null;
  status: ApplicationStatus;
  application_date: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  room_id: number;
  reported_by: string;
  issue_description: string;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
}
