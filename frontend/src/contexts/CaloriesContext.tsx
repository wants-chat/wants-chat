import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import caloriesApi, { UserProfile } from '../services/caloriesApi';
import { useAuth } from './AuthContext';

interface DashboardSummary {
  user: {
    name: string;
    streak: {
      current: number;
      record: number;
      days_to_beat_record: number;
    };
  };
  today: {
    date: string;
    calories: {
      consumed: number;
      burned: number;
      net: number;
      goal: number;
      remaining: number;
      percentage: number;
    };
    macros: {
      protein: {
        current: number;
        goal: number;
        percentage: number;
        remaining: number;
      };
      carbs: {
        current: number;
        goal: number;
        percentage: number;
        remaining: number;
      };
      fat: {
        current: number;
        goal: number;
        percentage: number;
        remaining: number;
      };
    };
    water: {
      current: number;
      goal: number;
      percentage: number;
      remaining: number;
    };
    meals_logged: number;
    exercise_minutes: number;
  };
  weight: {
    current: number;
    start: number;
    target: number;
    progress_percentage: number;
    weekly_change: number;
    monthly_change: number;
  };
  recommendations: string[];
}

interface DailyFoodSummary {
  date: string;
  summary: {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    total_fiber: number;
    total_sugar: number;
    calories_goal: number;
    calories_remaining: number;
    calories_burned: number;
    net_calories: number;
  };
  macros_percentage: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: {
    breakfast: { calories: number; protein: number; carbs: number; fat: number; logs: any[] };
    lunch: { calories: number; protein: number; carbs: number; fat: number; logs: any[] };
    dinner: { calories: number; protein: number; carbs: number; fat: number; logs: any[] };
    snacks: { calories: number; protein: number; carbs: number; fat: number; logs: any[] };
  };
}

interface CaloriesContextType {
  profile: UserProfile | null;
  dashboardData: DashboardSummary | null;
  todaysFoodLogs: DailyFoodSummary | null;
  isLoading: boolean;
  error: string | null;
  profileCheckComplete: boolean;
  refreshDashboard: () => Promise<void>;
  refreshFoodLogs: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CaloriesContext = createContext<CaloriesContextType | undefined>(undefined);

export const useCalories = () => {
  const context = useContext(CaloriesContext);
  if (context === undefined) {
    throw new Error('useCalories must be used within a CaloriesProvider');
  }
  return context;
};

interface CaloriesProviderProps {
  children: ReactNode;
}

export const CaloriesProvider: React.FC<CaloriesProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [todaysFoodLogs, setTodaysFoodLogs] = useState<DailyFoodSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);

  // Fetch user profile
  const refreshProfile = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await caloriesApi.getUserProfile();
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Don't set error for 404 - it means user hasn't completed onboarding yet
      if (err.statusCode !== 404) {
        setError(err.message || 'Failed to fetch profile');
      }
      // For 404, profile remains null which will trigger onboarding redirect
      setProfileCheckComplete(true);
    } finally {
      setIsLoading(false);
      setProfileCheckComplete(true);
    }
  };

  // Fetch dashboard summary
  const refreshDashboard = async () => {
    if (!isAuthenticated || !profile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const summary = await caloriesApi.getDashboardSummary();
      setDashboardData(summary);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      // Only set error for non-404 errors
      if (err.statusCode !== 404) {
        setError(err.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch today's food logs
  const refreshFoodLogs = async () => {
    if (!isAuthenticated || !profile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const logs = await caloriesApi.getTodaysFoodLogs();
      setTodaysFoodLogs(logs);
    } catch (err: any) {
      console.error('Error fetching food logs:', err);
      // Only set error for non-404 errors
      if (err.statusCode !== 404) {
        setError(err.message || 'Failed to fetch food logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setProfileCheckComplete(false);
      refreshProfile();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setDashboardData(null);
      setTodaysFoodLogs(null);
      // Add a small delay to ensure localStorage is ready
      setTimeout(() => {
        setProfileCheckComplete(true);
      }, 100);
    }
  }, [isAuthenticated]);

  // Load dashboard and food logs after profile is loaded
  useEffect(() => {
    if (profile && isAuthenticated) {
      refreshDashboard();
      refreshFoodLogs();
    }
  }, [profile, isAuthenticated]);

  const value = {
    profile,
    dashboardData,
    todaysFoodLogs,
    isLoading,
    error,
    profileCheckComplete,
    refreshDashboard,
    refreshFoodLogs,
    refreshProfile,
  };

  return <CaloriesContext.Provider value={value}>{children}</CaloriesContext.Provider>;
};