import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserOrganizations,
  getOrganization,
  createOrganization as apiCreateOrganization,
  Organization,
  CreateOrganizationDto,
} from '../services/organizationApi';

// Storage key for persisting selected organization
const SELECTED_ORG_KEY = 'selectedOrganizationId';

interface OrganizationContextType {
  /** List of user's organizations */
  organizations: Organization[];
  /** Currently selected organization (null for personal workspace) */
  currentOrganization: Organization | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh the organization list */
  fetchOrganizations: () => Promise<void>;
  /** Switch to a different organization (null for personal workspace) */
  switchOrganization: (orgId: string | null) => Promise<void>;
  /** Create a new organization and add to list */
  createOrganization: (data: CreateOrganizationDto) => Promise<Organization>;
  /** Refresh the current organization's details */
  refreshCurrentOrganization: () => Promise<void>;
  /** Clear any error state */
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  /**
   * Fetch all organizations for the current user
   */
  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setCurrentOrganization(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);
      return;
    } catch (err: any) {
      console.error('Failed to fetch organizations:', err);
      setError(err.message || 'Failed to fetch organizations');
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Switch to a different organization
   */
  const switchOrganization = useCallback(async (orgId: string | null) => {
    setError(null);

    if (orgId === null) {
      // Switch to personal workspace
      setCurrentOrganization(null);
      localStorage.removeItem(SELECTED_ORG_KEY);
      return;
    }

    // First check if org is in our list
    const existingOrg = organizations.find(org => org.id === orgId);
    if (existingOrg) {
      setCurrentOrganization(existingOrg);
      localStorage.setItem(SELECTED_ORG_KEY, orgId);
      return;
    }

    // If not found in list, fetch it
    setIsLoading(true);
    try {
      const org = await getOrganization(orgId);
      if (org) {
        setCurrentOrganization(org);
        localStorage.setItem(SELECTED_ORG_KEY, orgId);
        // Also add to organizations list if not present
        setOrganizations(prev => {
          if (!prev.find(o => o.id === orgId)) {
            return [...prev, org];
          }
          return prev;
        });
      } else {
        // Org not found, clear selection
        setCurrentOrganization(null);
        localStorage.removeItem(SELECTED_ORG_KEY);
        setError('Organization not found');
      }
    } catch (err: any) {
      console.error('Failed to switch organization:', err);
      setError(err.message || 'Failed to switch organization');
      // Clear invalid selection
      setCurrentOrganization(null);
      localStorage.removeItem(SELECTED_ORG_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [organizations]);

  /**
   * Create a new organization
   */
  const createOrganization = useCallback(async (data: CreateOrganizationDto): Promise<Organization> => {
    setError(null);
    setIsLoading(true);

    try {
      const newOrg = await apiCreateOrganization(data);

      // Add to organizations list
      setOrganizations(prev => [...prev, newOrg]);

      // Optionally switch to the new organization
      setCurrentOrganization(newOrg);
      localStorage.setItem(SELECTED_ORG_KEY, newOrg.id);

      return newOrg;
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(err.message || 'Failed to create organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh the current organization's details
   */
  const refreshCurrentOrganization = useCallback(async () => {
    if (!currentOrganization) {
      return;
    }

    setError(null);

    try {
      const updatedOrg = await getOrganization(currentOrganization.id);
      if (updatedOrg) {
        setCurrentOrganization(updatedOrg);
        // Also update in the organizations list
        setOrganizations(prev =>
          prev.map(org => org.id === updatedOrg.id ? updatedOrg : org)
        );
      } else {
        // Org was deleted or user lost access
        setCurrentOrganization(null);
        localStorage.removeItem(SELECTED_ORG_KEY);
        setOrganizations(prev => prev.filter(org => org.id !== currentOrganization.id));
      }
    } catch (err: any) {
      console.error('Failed to refresh current organization:', err);
      setError(err.message || 'Failed to refresh organization');
    }
  }, [currentOrganization]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load saved organization on mount when authenticated
   */
  useEffect(() => {
    const loadSavedOrganization = async () => {
      if (!isAuthenticated || initialLoadComplete) {
        return;
      }

      setIsLoading(true);

      try {
        // Fetch organizations first
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);

        // Check for saved organization ID
        const savedOrgId = localStorage.getItem(SELECTED_ORG_KEY);

        if (savedOrgId) {
          // Try to find in fetched orgs
          const savedOrg = orgs.find(org => org.id === savedOrgId);

          if (savedOrg) {
            setCurrentOrganization(savedOrg);
          } else {
            // Saved org not in list, try to fetch it directly
            try {
              const org = await getOrganization(savedOrgId);
              if (org) {
                setCurrentOrganization(org);
                // Add to list if not present
                if (!orgs.find(o => o.id === savedOrgId)) {
                  setOrganizations(prev => [...prev, org]);
                }
              } else {
                // Invalid saved org, clear it
                localStorage.removeItem(SELECTED_ORG_KEY);
              }
            } catch {
              // Failed to fetch saved org, clear it
              localStorage.removeItem(SELECTED_ORG_KEY);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load organizations:', err);
        setError(err.message || 'Failed to load organizations');
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };

    loadSavedOrganization();
  }, [isAuthenticated, initialLoadComplete]);

  /**
   * Reset state when user logs out
   */
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setError(null);
      setInitialLoadComplete(false);
    }
  }, [isAuthenticated, user]);

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    isLoading,
    error,
    fetchOrganizations,
    switchOrganization,
    createOrganization,
    refreshCurrentOrganization,
    clearError,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

/**
 * Hook to use the organization context
 */
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

/**
 * Hook to get the current organization ID (convenience)
 */
export const useCurrentOrganizationId = (): string | null => {
  const { currentOrganization } = useOrganization();
  return currentOrganization?.id ?? null;
};

export default OrganizationContext;
