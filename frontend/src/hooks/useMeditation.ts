import { useState, useEffect } from 'react';
import { 
  meditationService, 
  MeditationCategory, 
  FeaturedCategory,
  MeditationStats,
  AmbientSound,
  AudioContent
} from '../services/meditationService';

interface UseMeditationReturn {
  // Categories
  categories: MeditationCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Featured
  featured: FeaturedCategory[];
  featuredLoading: boolean;
  featuredError: string | null;
  
  // Stats
  stats: MeditationStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Ambient Sounds
  ambientSounds: AmbientSound[];
  ambientLoading: boolean;
  ambientError: string | null;
  
  // Audio Library
  audioLibrary: AudioContent[];
  audioLoading: boolean;
  audioError: string | null;
  
  // Refetch functions
  refetchCategories: () => Promise<void>;
  refetchFeatured: () => Promise<void>;
  refetchStats: (timeframe?: string) => Promise<void>;
  refetchAmbientSounds: () => Promise<void>;
  refetchAudioLibrary: (params?: { category?: string; type?: string }) => Promise<void>;
}

export const useMeditation = (): UseMeditationReturn => {
  // Categories state
  const [categories, setCategories] = useState<MeditationCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Featured state
  const [featured, setFeatured] = useState<FeaturedCategory[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  
  // Stats state
  const [stats, setStats] = useState<MeditationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Ambient sounds state
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [ambientLoading, setAmbientLoading] = useState(false);
  const [ambientError, setAmbientError] = useState<string | null>(null);
  
  // Audio library state
  const [audioLibrary, setAudioLibrary] = useState<AudioContent[]>([]);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await meditationService.getMeditationCategories();
      setCategories(data);
    } catch (err: any) {
      setCategoriesError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch featured
  const fetchFeatured = async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const data = await meditationService.getFeaturedMeditations();
      setFeatured(data.categories || []);
    } catch (err: any) {
      setFeaturedError(err.message || 'Failed to fetch featured meditations');
      console.error('Error fetching featured:', err);
      setFeatured([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async (timeframe?: string) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await meditationService.getEnhancedStats(timeframe);
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch ambient sounds
  const fetchAmbientSounds = async () => {
    try {
      setAmbientLoading(true);
      setAmbientError(null);
      const data = await meditationService.getAmbientSounds();
      setAmbientSounds(data);
    } catch (err: any) {
      setAmbientError(err.message || 'Failed to fetch ambient sounds');
      console.error('Error fetching ambient sounds:', err);
    } finally {
      setAmbientLoading(false);
    }
  };

  // Fetch audio library
  const fetchAudioLibrary = async (params?: { category?: string; type?: string }) => {
    try {
      setAudioLoading(true);
      setAudioError(null);
      const data = await meditationService.getAudioLibrary(params);
      setAudioLibrary(data);
    } catch (err: any) {
      setAudioError(err.message || 'Failed to fetch audio library');
      console.error('Error fetching audio library:', err);
    } finally {
      setAudioLoading(false);
    }
  };

  // Initial load - categories, featured, and audio library
  useEffect(() => {
    fetchCategories();
    fetchFeatured();
    fetchAudioLibrary(); // Fetch audio files on mount
  }, []);

  return {
    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    
    // Featured
    featured,
    featuredLoading,
    featuredError,
    
    // Stats
    stats,
    statsLoading,
    statsError,
    
    // Ambient sounds
    ambientSounds,
    ambientLoading,
    ambientError,
    
    // Audio library
    audioLibrary,
    audioLoading,
    audioError,
    
    // Refetch functions
    refetchCategories: fetchCategories,
    refetchFeatured: fetchFeatured,
    refetchStats: fetchStats,
    refetchAmbientSounds: fetchAmbientSounds,
    refetchAudioLibrary: fetchAudioLibrary
  };
};