/**
 * Medical facilities type definitions for health module
 */

export interface MedicalFacility {
  id: string;
  userId: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'urgent-care';
  phone: string;
  address: string;
  hours?: string;
  emergencyAvailable: boolean;
  distance?: string;
  specialties?: string[];
  notes?: string;
  website?: string;
  insurance?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalFacilityFormData {
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'urgent-care';
  phone: string;
  address: string;
  hours?: string;
  emergencyAvailable: boolean;
  distance?: string;
  specialties?: string[];
  notes?: string;
  website?: string;
  insurance?: string[];
}

export interface MedicalFacilityQueryParams {
  page?: number;
  limit?: number;
  type?: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'urgent-care';
  emergencyAvailable?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}