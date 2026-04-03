/**
 * Custom hooks for Baby Care tracking during pregnancy
 * Manages baby measurements, milestones, and vaccinations
 */

import { useState, useCallback, useEffect } from 'react';
import { useApi, useMutation } from '../useApi';
import { healthService } from '../../services/healthService';

// Baby measurement interface
export interface BabyMeasurement {
  id?: string;
  date: string;
  weight: number; // in kg
  length: number; // in cm
  headCircumference: number; // in cm
  week?: number;
  notes?: string;
}

// Development milestone interface
export interface DevelopmentMilestone {
  id: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  title: string;
  description: string;
  expectedWeek: number;
  achieved: boolean;
  achievedDate?: string;
}

// Vaccination record interface
export interface VaccinationRecord {
  id: string;
  name: string;
  scheduledWeek: number;
  administeredDate?: string;
  status: 'scheduled' | 'completed' | 'overdue';
  notes?: string;
}

// Baby size comparison data for each pregnancy week
export interface BabySizeComparison {
  week: number;
  fruit: string;
  weight: string;
  length: string;
}

// Full baby care data
export interface BabyCareData {
  measurements: BabyMeasurement[];
  milestones: DevelopmentMilestone[];
  vaccinations: VaccinationRecord[];
  currentWeek: number;
}

/**
 * Get baby size comparisons by week
 * Static reference data for fetal size visualization
 */
export const getBabySizeComparisons = (): BabySizeComparison[] => [
  { week: 20, fruit: 'Banana', weight: '300g', length: '25cm' },
  { week: 21, fruit: 'Carrot', weight: '360g', length: '27cm' },
  { week: 22, fruit: 'Papaya', weight: '430g', length: '28cm' },
  { week: 23, fruit: 'Grapefruit', weight: '500g', length: '29cm' },
  { week: 24, fruit: 'Corn', weight: '600g', length: '30cm' },
  { week: 25, fruit: 'Cauliflower', weight: '660g', length: '34cm' },
  { week: 26, fruit: 'Lettuce', weight: '760g', length: '35cm' },
  { week: 27, fruit: 'Cabbage', weight: '875g', length: '37cm' },
  { week: 28, fruit: 'Eggplant', weight: '1kg', length: '38cm' },
  { week: 29, fruit: 'Butternut Squash', weight: '1.15kg', length: '39cm' },
  { week: 30, fruit: 'Cabbage', weight: '1.3kg', length: '40cm' },
  { week: 31, fruit: 'Coconut', weight: '1.5kg', length: '41cm' },
  { week: 32, fruit: 'Jicama', weight: '1.7kg', length: '42cm' },
  { week: 33, fruit: 'Pineapple', weight: '1.9kg', length: '43cm' },
  { week: 34, fruit: 'Cantaloupe', weight: '2.1kg', length: '45cm' },
  { week: 35, fruit: 'Honeydew Melon', weight: '2.4kg', length: '46cm' },
  { week: 36, fruit: 'Romaine Lettuce', weight: '2.6kg', length: '47cm' },
  { week: 37, fruit: 'Winter Melon', weight: '2.9kg', length: '48cm' },
  { week: 38, fruit: 'Leek', weight: '3.1kg', length: '49cm' },
  { week: 39, fruit: 'Mini Watermelon', weight: '3.3kg', length: '50cm' },
  { week: 40, fruit: 'Watermelon', weight: '3.5kg', length: '51cm' },
];

/**
 * Get default milestones for pregnancy
 */
export const getDefaultMilestones = (): DevelopmentMilestone[] => [
  {
    id: '1',
    category: 'motor',
    title: 'Kicks and Stretches',
    description: 'Baby shows regular movement patterns',
    expectedWeek: 20,
    achieved: false,
  },
  {
    id: '2',
    category: 'cognitive',
    title: 'Responds to Sound',
    description: 'Baby reacts to loud noises and familiar voices',
    expectedWeek: 22,
    achieved: false,
  },
  {
    id: '3',
    category: 'motor',
    title: 'Regular Sleep Cycles',
    description: 'Baby develops distinct sleep and wake patterns',
    expectedWeek: 24,
    achieved: false,
  },
  {
    id: '4',
    category: 'social',
    title: 'Responds to Touch',
    description: 'Baby reacts to gentle touches on belly',
    expectedWeek: 26,
    achieved: false,
  },
  {
    id: '5',
    category: 'cognitive',
    title: 'Opens Eyes',
    description: 'Baby can open eyes and respond to light',
    expectedWeek: 28,
    achieved: false,
  },
  {
    id: '6',
    category: 'motor',
    title: 'Hiccups',
    description: 'Baby may experience hiccups regularly',
    expectedWeek: 30,
    achieved: false,
  },
  {
    id: '7',
    category: 'cognitive',
    title: 'Dreams',
    description: 'Baby shows REM sleep patterns indicating dreaming',
    expectedWeek: 32,
    achieved: false,
  },
  {
    id: '8',
    category: 'motor',
    title: 'Head Down Position',
    description: 'Baby typically moves to head-down position',
    expectedWeek: 36,
    achieved: false,
  },
];

/**
 * Get recommended vaccinations during pregnancy
 */
export const getPregnancyVaccinations = (): VaccinationRecord[] => [
  {
    id: '1',
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    scheduledWeek: 27,
    status: 'scheduled',
    notes: 'Protects baby from whooping cough',
  },
  {
    id: '2',
    name: 'Flu Vaccine (Influenza)',
    scheduledWeek: 20,
    status: 'scheduled',
    notes: 'Annual flu protection - safe during any trimester',
  },
  {
    id: '3',
    name: 'RhoGAM (if Rh-negative)',
    scheduledWeek: 28,
    status: 'scheduled',
    notes: 'Prevents Rh incompatibility - only if mother is Rh-negative',
  },
  {
    id: '4',
    name: 'COVID-19 Vaccine',
    scheduledWeek: 20,
    status: 'scheduled',
    notes: 'Recommended during pregnancy - consult your provider',
  },
];

/**
 * Hook to fetch baby measurements from pregnancy records
 */
export const useBabyMeasurements = () => {
  const [measurements, setMeasurements] = useState<BabyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch pregnancy records which contain baby measurements
      const response = await healthService.getPregnancyRecords({ limit: 100 });

      // Transform pregnancy records to baby measurements
      // Using ultrasound records which typically have baby measurements
      // Note: API returns camelCase fields (recordType, recordDate, fundusHeight)
      const babyMeasurements: BabyMeasurement[] = response.data
        .filter((record: any) => {
          const recordType = record.record_type || record.recordType;
          return recordType === 'ultrasound' || record.metadata?.baby_measurements;
        })
        .map((record: any) => {
          // Handle both snake_case and camelCase field names from API
          const recordDate = record.record_date || record.recordDate;
          const fundusHeight = record.fundus_height || record.fundusHeight;

          // Parse weight - could be number or string
          let weight = record.metadata?.baby_weight || record.weight || 0;
          if (typeof weight === 'string') weight = parseFloat(weight) || 0;

          // Parse length from fundus height
          let length = record.metadata?.baby_length || fundusHeight || 0;
          if (typeof length === 'string') length = parseFloat(length) || 0;

          return {
            id: record.id,
            date: recordDate,
            weight,
            length,
            headCircumference: record.metadata?.head_circumference || 0,
            week: record.week,
            notes: record.notes,
          };
        })
        .filter((m: BabyMeasurement) => m.weight > 0 || m.length > 0);

      setMeasurements(babyMeasurements);
    } catch (err) {
      console.error('Failed to fetch baby measurements:', err);
      setError('Failed to load baby measurements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  return {
    measurements,
    isLoading,
    error,
    refetch: fetchMeasurements,
  };
};

/**
 * Hook to add a baby measurement
 */
export const useAddBabyMeasurement = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    async (measurement: Omit<BabyMeasurement, 'id'>) => {
      // Create a pregnancy record with baby measurement data
      // Using camelCase field names as expected by healthService.createPregnancyRecord
      const pregnancyData = {
        recordType: 'ultrasound',
        recordDate: measurement.date,
        week: String(measurement.week || 24),
        notes: measurement.notes || `Baby measurement - Weight: ${measurement.weight}kg, Length: ${measurement.length}cm, Head: ${measurement.headCircumference}cm`,
        symptoms: [],
        medications: [],
        // Store baby measurements in supported fields
        weight: String(measurement.weight), // Mother's weight field - we'll use notes for baby data
        fundusHeight: String(measurement.length), // Use fundus height for baby length approximation
        babyHeartRate: '', // Optional
      };

      return healthService.createPregnancyRecord(pregnancyData as any);
    },
    {
      onSuccess: (data) => {
        console.log('Baby measurement added successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to add baby measurement:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to manage milestones (stored in localStorage for now, can be extended to use API)
 */
export const useMilestones = () => {
  const [milestones, setMilestones] = useState<DevelopmentMilestone[]>(() => {
    const stored = localStorage.getItem('baby_milestones');
    return stored ? JSON.parse(stored) : getDefaultMilestones();
  });

  const updateMilestone = useCallback((id: string, achieved: boolean, achievedDate?: string) => {
    setMilestones(prev => {
      const updated = prev.map(m =>
        m.id === id
          ? { ...m, achieved, achievedDate: achieved ? (achievedDate || new Date().toISOString().split('T')[0]) : undefined }
          : m
      );
      localStorage.setItem('baby_milestones', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetMilestones = useCallback(() => {
    const defaults = getDefaultMilestones();
    setMilestones(defaults);
    localStorage.setItem('baby_milestones', JSON.stringify(defaults));
  }, []);

  return {
    milestones,
    updateMilestone,
    resetMilestones,
  };
};

/**
 * Hook to manage vaccinations (stored in localStorage for now, can be extended to use API)
 */
export const useVaccinations = () => {
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => {
    const stored = localStorage.getItem('pregnancy_vaccinations');
    return stored ? JSON.parse(stored) : getPregnancyVaccinations();
  });

  const updateVaccination = useCallback((id: string, status: 'scheduled' | 'completed' | 'overdue', administeredDate?: string) => {
    setVaccinations(prev => {
      const updated = prev.map(v =>
        v.id === id
          ? { ...v, status, administeredDate: status === 'completed' ? (administeredDate || new Date().toISOString().split('T')[0]) : undefined }
          : v
      );
      localStorage.setItem('pregnancy_vaccinations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const checkOverdueVaccinations = useCallback((currentWeek: number) => {
    setVaccinations(prev => {
      const updated = prev.map(v =>
        v.status === 'scheduled' && v.scheduledWeek < currentWeek
          ? { ...v, status: 'overdue' as const }
          : v
      );
      localStorage.setItem('pregnancy_vaccinations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    vaccinations,
    updateVaccination,
    checkOverdueVaccinations,
  };
};

/**
 * Combined hook for all baby care data
 */
export const useBabyCare = (currentWeek: number = 24) => {
  const { measurements, isLoading: measurementsLoading, error: measurementsError, refetch: refetchMeasurements } = useBabyMeasurements();
  const { milestones, updateMilestone, resetMilestones } = useMilestones();
  const { vaccinations, updateVaccination, checkOverdueVaccinations } = useVaccinations();

  // Check for overdue vaccinations when week changes
  useEffect(() => {
    checkOverdueVaccinations(currentWeek);
  }, [currentWeek, checkOverdueVaccinations]);

  // Get latest measurement
  const latestMeasurement = measurements.length > 0
    ? measurements[measurements.length - 1]
    : null;

  // Get size comparison for current week
  const sizeComparisons = getBabySizeComparisons();
  const currentSizeComparison = sizeComparisons.find(s => s.week === currentWeek)
    || sizeComparisons.find(s => s.week <= currentWeek)
    || sizeComparisons[0];

  // Calculate percentiles (simplified - in real app, use WHO growth charts)
  // Weight is now in grams (g), length and head in cm
  const calculatePercentile = (value: number, type: 'weight' | 'length' | 'head') => {
    const ranges = {
      weight: { p10: 1500, p50: 2000, p90: 2500 }, // in grams
      length: { p10: 35, p50: 40, p90: 45 }, // in cm
      head: { p10: 22, p50: 25, p90: 28 }, // in cm
    };

    const range = ranges[type];
    if (value < range.p10) return 10;
    if (value < range.p50) return 50;
    if (value < range.p90) return 75;
    return 90;
  };

  return {
    // Measurements
    measurements,
    latestMeasurement,
    measurementsLoading,
    measurementsError,
    refetchMeasurements,

    // Milestones
    milestones,
    updateMilestone,
    resetMilestones,

    // Vaccinations
    vaccinations,
    updateVaccination,

    // Size comparisons
    sizeComparisons,
    currentSizeComparison,

    // Utilities
    calculatePercentile,

    // Overall loading state
    isLoading: measurementsLoading,
    error: measurementsError,
  };
};
