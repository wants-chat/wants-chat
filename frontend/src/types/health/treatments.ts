/**
 * Treatment-related type definitions
 */

export interface Treatment {
  id: string;
  userId: string;
  name: string;
  type: TreatmentType;
  frequency: TreatmentFrequency;
  startDate: string;
  endDate?: string;
  doctor: string;
  location: string;
  duration?: string;
  dosage?: string;
  instructions?: string;
  priority: TreatmentPriority;
  reminder: boolean;
  reminderTime?: string;
  notes?: string;
  sideEffects: string[];
  cost?: string;
  insurance?: string;
  status: TreatmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type TreatmentType = 
  | 'medication' 
  | 'therapy' 
  | 'procedure' 
  | 'test' 
  | 'consultation' 
  | 'surgery' 
  | 'chemotherapy' 
  | 'dialysis' 
  | 'rehabilitation';

export type TreatmentFrequency = 
  | 'once' 
  | 'daily' 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'as-needed';

export type TreatmentPriority = 'low' | 'medium' | 'high' | 'critical';

export type TreatmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'paused';

export interface CreateTreatmentRequest {
  name: string;
  type: TreatmentType;
  frequency: TreatmentFrequency;
  startDate: string;
  endDate?: string;
  doctor: string;
  location: string;
  duration?: string;
  dosage?: string;
  instructions?: string;
  priority: TreatmentPriority;
  reminder: boolean;
  reminderTime?: string;
  notes?: string;
  sideEffects: string[];
  cost?: string;
  insurance?: string;
}

export interface UpdateTreatmentRequest extends Partial<CreateTreatmentRequest> {
  status?: TreatmentStatus;
}

export interface TreatmentQueryParams {
  page?: number;
  limit?: number;
  type?: TreatmentType;
  status?: TreatmentStatus;
  priority?: TreatmentPriority;
  startDate?: string;
  endDate?: string;
  sort?: 'name' | 'startDate' | 'priority' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface TreatmentResponse {
  data: Treatment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}