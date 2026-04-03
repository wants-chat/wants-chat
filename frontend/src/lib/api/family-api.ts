/**
 * Family Membership API Client
 * Handles family invitations and membership management
 */

import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface FamilyMember {
  id: string;
  ownerUserId: string;
  memberUserId: string | null;
  memberEmail: string;
  memberName: string | null;
  status: 'pending' | 'accepted' | 'removed';
  inviteSentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMembersResponse {
  members: FamilyMember[];
  total: number;
  maxMembers: number;
  remainingSlots: number;
}

export interface FamilyMembershipStatus {
  isFamilyMember: boolean;
  membership: {
    id: string;
    ownerUserId: string;
    memberEmail: string;
    memberName: string | null;
    acceptedAt: string | null;
  } | null;
  reason?: string;
}

export interface InviteFamilyMemberRequest {
  email: string;
  name?: string;
}

// Query Keys
export const familyKeys = {
  all: ['family'] as const,
  members: () => [...familyKeys.all, 'members'] as const,
  membership: () => [...familyKeys.all, 'membership'] as const,
};

// API Functions
export const familyApi = {
  /**
   * Get all family members (for Premium owners)
   */
  async getFamilyMembers(): Promise<FamilyMembersResponse> {
    return api.get<FamilyMembersResponse>('/billing/family/members');
  },

  /**
   * Invite a family member
   */
  async inviteFamilyMember(data: InviteFamilyMemberRequest): Promise<FamilyMember> {
    return api.post<FamilyMember>('/billing/family/invite', data);
  },

  /**
   * Remove a family member
   */
  async removeFamilyMember(memberId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/billing/family/remove/${memberId}`, {});
  },

  /**
   * Check if current user is a family member
   */
  async getFamilyMembership(): Promise<FamilyMembershipStatus> {
    return api.get<FamilyMembershipStatus>('/billing/family/membership');
  },

  /**
   * Leave family membership (for members, not owners)
   */
  async leaveFamilyMembership(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/billing/family/leave', {});
  },

  /**
   * Auto-add pending family memberships (called after login)
   */
  async autoAddPendingMemberships(): Promise<{ addedCount: number }> {
    return api.post<{ addedCount: number }>('/billing/family/auto-add', {});
  },
};

// React Query Hooks

/**
 * Hook to get family members
 */
export const useFamilyMembers = () => {
  return useQuery({
    queryKey: familyKeys.members(),
    queryFn: () => familyApi.getFamilyMembers(),
  });
};

/**
 * Hook to check family membership status
 */
export const useFamilyMembership = () => {
  return useQuery({
    queryKey: familyKeys.membership(),
    queryFn: () => familyApi.getFamilyMembership(),
  });
};

/**
 * Hook to invite a family member
 */
export const useInviteFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteFamilyMemberRequest) => familyApi.inviteFamilyMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.members() });
    },
  });
};

/**
 * Hook to remove a family member
 */
export const useRemoveFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => familyApi.removeFamilyMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.members() });
    },
  });
};

/**
 * Hook to leave family membership
 */
export const useLeaveFamilyMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => familyApi.leaveFamilyMembership(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.membership() });
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
};

/**
 * Hook to auto-add pending memberships
 */
export const useAutoAddPendingMemberships = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => familyApi.autoAddPendingMemberships(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.membership() });
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
};
