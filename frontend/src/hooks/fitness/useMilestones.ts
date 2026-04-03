import { useState, useEffect } from 'react';
import { fitnessService, Milestone } from '../../services/fitnessService';

interface UseMilestonesResult {
  milestones: Milestone[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMilestones = (): UseMilestonesResult => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fitnessService.getMilestones();
      setMilestones(response.data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err as Error);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  return {
    milestones,
    loading,
    error,
    refetch: fetchMilestones
  };
};