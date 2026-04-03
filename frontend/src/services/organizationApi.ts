/**
 * Organization API Service
 * Handles all organization-related API calls including invitations and member management
 */

import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  member_count?: number;
  current_user_role?: OrganizationRole;
  /** Alias for current_user_role for component compatibility */
  userRole?: OrganizationRole;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  /** Alias for user_id for component compatibility */
  userId: string;
  role: OrganizationRole;
  invited_by?: string;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    fullName?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  /** Alias for created_at */
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  inviter?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface PublicInvitation {
  email: string;
  role: OrganizationRole;
  organization_name: string;
  organization_logo?: string;
  inviter_name: string;
  expires_at: string;
  is_valid: boolean;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  organization_id: string;
  organization_name: string;
  role: OrganizationRole;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  logo_url?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, any>;
}

export interface InviteMemberDto {
  email: string;
  role?: OrganizationRole;
  message?: string;
}

export interface UpdateMemberRoleDto {
  user_id?: string;
  role: OrganizationRole;
}

// ============================================
// ORGANIZATION CRUD
// ============================================

/**
 * Create a new organization
 */
export async function createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
  const response = await api.post('/organizations', dto);
  return response.data;
}

/**
 * Get all organizations for the current user
 */
export async function getUserOrganizations(): Promise<Organization[]> {
  const response = await api.get('/organizations');
  const orgs = response.data.organizations || response.data || [];
  // Add userRole alias for compatibility
  return orgs.map((org: Organization) => ({
    ...org,
    userRole: org.current_user_role || org.userRole,
  }));
}

/**
 * Alias for getUserOrganizations
 */
export async function getMyOrganizations(): Promise<Organization[]> {
  return getUserOrganizations();
}

/**
 * Get a specific organization by ID
 */
export async function getOrganization(id: string): Promise<Organization | null> {
  const response = await api.get(`/organizations/${id}`);
  const org = response.data;
  if (org) {
    org.userRole = org.current_user_role || org.userRole;
  }
  return org;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const response = await api.get(`/organizations/slug/${slug}`);
  return response.data;
}

/**
 * Update an organization
 */
export async function updateOrganization(
  id: string,
  dto: UpdateOrganizationDto
): Promise<Organization> {
  const response = await api.patch(`/organizations/${id}`, dto);
  return response.data;
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string): Promise<{ success: boolean }> {
  const response = await api.delete(`/organizations/${id}`);
  return response.data;
}

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Get all members of an organization
 */
export async function getMembers(orgId: string): Promise<OrganizationMember[]> {
  const response = await api.get(`/organizations/${orgId}/members`);
  const members = response.data.members || response.data || [];
  // Add userId alias and fullName for compatibility
  return members.map((m: OrganizationMember) => ({
    ...m,
    userId: m.user_id || m.userId,
    user: m.user ? {
      ...m.user,
      fullName: m.user.fullName || `${m.user.first_name || ''} ${m.user.last_name || ''}`.trim() || m.user.email,
    } : undefined,
  }));
}

/**
 * Alias for getMembers
 */
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  return getMembers(orgId);
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  orgId: string,
  memberIdOrDto: string | UpdateMemberRoleDto,
  dto?: UpdateMemberRoleDto
): Promise<OrganizationMember> {
  // Support both (orgId, memberId, { role }) and (orgId, { user_id, role }) signatures
  if (typeof memberIdOrDto === 'string' && dto) {
    const response = await api.patch(`/organizations/${orgId}/members/${memberIdOrDto}/role`, dto);
    return response.data;
  } else {
    const response = await api.patch(`/organizations/${orgId}/members/role`, memberIdOrDto);
    return response.data;
  }
}

/**
 * Remove a member from the organization
 */
export async function removeMember(
  orgId: string,
  userId: string
): Promise<{ success: boolean }> {
  const response = await api.delete(`/organizations/${orgId}/members/${userId}`);
  return response.data;
}

/**
 * Leave an organization
 */
export async function leaveOrganization(orgId: string): Promise<{ success: boolean }> {
  const response = await api.post(`/organizations/${orgId}/leave`);
  return response.data;
}

// ============================================
// INVITATIONS
// ============================================

/**
 * Invite a member to the organization
 */
export async function inviteMember(
  orgId: string,
  dto: InviteMemberDto
): Promise<OrganizationInvitation> {
  const response = await api.post(`/organizations/${orgId}/invitations`, dto);
  return response.data;
}

/**
 * Get pending invitations for an organization
 */
export async function getPendingInvitations(
  orgId: string
): Promise<OrganizationInvitation[]> {
  const response = await api.get(`/organizations/${orgId}/invitations`);
  return response.data.invitations;
}

/**
 * Resend an invitation
 */
export async function resendInvitation(
  orgId: string,
  invitationId: string
): Promise<OrganizationInvitation> {
  const response = await api.post(
    `/organizations/${orgId}/invitations/${invitationId}/resend`
  );
  return response.data;
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(
  orgId: string,
  invitationId: string
): Promise<{ success: boolean }> {
  const response = await api.delete(
    `/organizations/${orgId}/invitations/${invitationId}`
  );
  return response.data;
}

// ============================================
// PUBLIC INVITATION ENDPOINTS
// ============================================

/**
 * Get invitation details by token (no auth required for viewing)
 */
export async function getInvitationByToken(token: string): Promise<PublicInvitation | null> {
  const response = await api.get(`/organizations/invitations/token/${token}`);
  return response.data;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
  const response = await api.post('/organizations/invitations/accept', { token });
  return response.data;
}

/**
 * Decline an invitation
 */
export async function declineInvitation(token: string): Promise<{ success: boolean }> {
  const response = await api.post('/organizations/invitations/decline', { token });
  return response.data;
}

/**
 * Get pending invitations for the current user
 */
export async function getMyPendingInvitations(): Promise<OrganizationInvitation[]> {
  const response = await api.get('/organizations/my/invitations');
  const invitations = response.data.invitations || response.data || [];
  // Add createdAt alias for compatibility
  return invitations.map((inv: OrganizationInvitation) => ({
    ...inv,
    createdAt: inv.created_at || inv.createdAt,
  }));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  userRole: OrganizationRole | undefined,
  requiredRoles: OrganizationRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OrganizationRole): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: OrganizationRole): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'member':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'viewer':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// ============================================
// SYNC FROM ONBOARDING
// ============================================

export interface SyncOrganizationResponse {
  created: boolean;
  organizationName?: string;
  organizationId?: string;
  message?: string;
}

/**
 * Sync organization from onboarding company_name
 * Creates organization if company_name exists in onboarding but no org exists
 */
export async function syncOrganizationFromOnboarding(): Promise<SyncOrganizationResponse> {
  const response = await api.post('/onboarding/sync-organization');
  return response.data;
}
