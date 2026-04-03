import { useState, useEffect } from 'react';
import { fitnessService, Achievement } from '../../services/fitnessService';

interface UseAchievementsResult {
  achievements: Achievement[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useAchievements = (): UseAchievementsResult => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fitnessService.getAchievements();
      setAchievements(response.data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err as Error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements
  };
};