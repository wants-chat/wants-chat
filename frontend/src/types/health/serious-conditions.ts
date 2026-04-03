/**
 * Serious Conditions Types
 * Types for managing serious health conditions
 */

export interface Treatment {
  type: string;
  startDate: string;
  endDate?: string;
  frequency?: string;
  notes?: string;

  // Legacy
  start_date?: string;
  end_date?: string;
}

export interface ReportFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;

  // Legacy
  file_name?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  uploaded_at?: string;
}

export interface SeriousCondition {
  id: string;
  userId: string;
  condition: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'remission' | 'monitoring' | 'resolved';
  treatingDoctor: string;
  hospital: string;
  lastCheckup: string;
  nextCheckup: string;
  emergencyContact: string;
  treatments: Treatment[];
  medications: string[];
  reports: ReportFile[];
  notes: string;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  diagnosis_date?: string;
  treating_doctor?: string;
  last_checkup?: string;
  next_checkup?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeriousConditionFormData {
  condition: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'remission' | 'monitoring' | 'resolved';
  treatingDoctor: string;
  hospital: string;
  lastCheckup: string;
  nextCheckup: string;
  emergencyContact: string;
  treatments: Treatment[];
  medications: string[];
  reports?: File[]; // For form submission
  notes: string;

  // Legacy
  diagnosis_date?: string;
  treating_doctor?: string;
  last_checkup?: string;
  next_checkup?: string;
  emergency_contact?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  [key: string]: any;
}