/**
 * Emergency contacts type definitions for health module
 */

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'doctor' | 'caregiver' | 'friend' | 'other';
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  category: 'personal' | 'medical' | 'emergency-service';
  notes?: string;
  availability?: string;
  specialization?: string; // For medical contacts
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContactFormData {
  name: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'doctor' | 'caregiver' | 'friend' | 'other';
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  category: 'personal' | 'medical' | 'emergency-service';
  notes?: string;
  availability?: string;
  specialization?: string;
}

export interface EmergencyContactQueryParams {
  page?: number;
  limit?: number;
  category?: 'personal' | 'medical' | 'emergency-service';
  relationship?: string;
  isPrimary?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}