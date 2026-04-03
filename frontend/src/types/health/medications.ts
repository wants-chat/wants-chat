/**
 * Medication-related types
 */

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  instructions?: string;
  sideEffects?: string;
  reason?: string;
}

export interface Prescription {
  id: string;
  userId: string;

  // Primary fields (camelCase)
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  prescribedBy?: string;
  prescriptionDate?: string;
  prescriptionNumber?: string;
  startDate?: string;
  endDate?: string;
  refillsRemaining?: number;
  pharmacy?: string;
  instructions?: string;
  medications?: Medication[];
  notes?: string;
  status?: 'active' | 'completed' | 'discontinued';
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  prescribed_by?: string;
  prescription_date?: string;
  start_date?: string;
  end_date?: string;
  refills_remaining?: number;
  created_at?: string;
  updated_at?: string;
}