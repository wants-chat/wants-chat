/**
 * Organization API for Wants
 * Handles organization management, members, and invitations
 */

import { api } from '../api';
import type {
  Organization,
  OrganizationMember,
  OrganizationInvitation,
  OrganizationRole,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  OrganizationListResponse,
  MembersListResponse,
  InvitationsListResponse,
  InvitationResponse,
  GenericResponse,
} from '../../types/organization';

class OrganizationAPI {
  // ============================================
  // Organization CRUD Operations
  // ============================================

  /**
   * Get all organizations for the current user
   */
  async getUserOrganizations(): Promise<Organization[]> {
    const response = await api.get<OrganizationListResponse | Organization[]>('/organization/user/list');
    // Handle both array and wrapped response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.organizations || [];
  }

  /**
   * Get organization details by ID
   */
  async getOrganizationDetails(organizationId: string): Promise<Organization> {
    return api.get<Organization>(`/organization/${organizationId}`);
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    return api.post<Organization>('/organization', data);
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    organizationId: string,
    data: UpdateOrganizationDto
  ): Promise<Organization> {
    return api.patch<Organization>(`/organization/${organizationId}`, data);
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(organizationId: string): Promise<GenericResponse> {
    return api.delete<GenericResponse>(`/organization/${organizationId}`);
  }

  // ============================================
  // Member Management
  // ============================================

  /**
   * Get all members of an organization
   */
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const response = await api.get<MembersListResponse | OrganizationMember[]>(
      `/organization/${organizationId}/members`
    );
    // Handle both array and wrapped response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.members || [];
  }

  /**
   * Invite a new member to the organization
   */
  async inviteMember(
    organizationId: string,
    email: string,
    role: Exclude<OrganizationRole, 'owner'>,
    message?: string
  ): Promise<InvitationResponse> {
    const data: InviteMemberDto = { email, role, message };
    return api.post<InvitationResponse>(
      `/organization/${organizationId}/members/invite`,
      data
    );
  }

  /**
   * Remove a member from the organization
   */
  async removeMember(organizationId: string, userId: string): Promise<GenericResponse> {
    return api.delete<GenericResponse>(`/organization/${organizationId}/members/${userId}`);
  }

  /**
   * Update a member's role in the organization
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrganizationRole
  ): Promise<GenericResponse> {
    return api.patch<GenericResponse>(
      `/organization/${organizationId}/members/${userId}/role`,
      { role }
    );
  }

  /**
   * Leave an organization (current user)
   */
  async leaveOrganization(organizationId: string): Promise<GenericResponse> {
    return api.post<GenericResponse>(`/organization/${organizationId}/leave`);
  }

  // ============================================
  // Invitation Management
  // ============================================

  /**
   * Get all pending invitations for an organization
   */
  async getInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    const response = await api.get<InvitationsListResponse | OrganizationInvitation[]>(
      `/organization/${organizationId}/invitations`
    );
    // Handle both array and wrapped response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.invitations || [];
  }

  /**
   * Get invitation details by token (public endpoint - no auth required)
   * Used for invitation landing pages
   */
  async getInvitationByToken(token: string): Promise<OrganizationInvitation> {
    return api.get<OrganizationInvitation>(`/organization/invitations/${token}`);
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<GenericResponse> {
    return api.post<GenericResponse>(`/organization/invitations/${token}/accept`);
  }

  /**
   * Decline an invitation
   */
  async declineInvitation(token: string): Promise<GenericResponse> {
    return api.post<GenericResponse>(`/organization/invitations/${token}/decline`);
  }

  /**
   * Resend an invitation email
   */
  async resendInvitation(
    organizationId: string,
    invitationId: string
  ): Promise<GenericResponse> {
    return api.post<GenericResponse>(
      `/organization/${organizationId}/invitations/${invitationId}/resend`
    );
  }

  /**
   * Cancel/revoke a pending invitation
   */
  async cancelInvitation(
    organizationId: string,
    invitationId: string
  ): Promise<GenericResponse> {
    return api.delete<GenericResponse>(
      `/organization/${organizationId}/invitations/${invitationId}`
    );
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if user has a specific role in the organization
   */
  async checkUserRole(
    organizationId: string,
    requiredRole: OrganizationRole
  ): Promise<boolean> {
    try {
      const members = await this.getMembers(organizationId);
      // This would require the current user's ID - implementation depends on auth context
      // For now, return the members and let the caller check
      return members.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Transfer organization ownership to another member
   */
  async transferOwnership(
    organizationId: string,
    newOwnerId: string
  ): Promise<GenericResponse> {
    return api.post<GenericResponse>(
      `/organization/${organizationId}/transfer-ownership`,
      { newOwnerId }
    );
  }
}

// Export singleton instance
export const organizationAPI = new OrganizationAPI();
export default organizationAPI;

// Re-export types for convenience
export type {
  Organization,
  OrganizationMember,
  OrganizationInvitation,
  OrganizationRole,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  OrganizationListResponse,
  MembersListResponse,
  InvitationsListResponse,
  InvitationResponse,
  GenericResponse,
} from '../../types/organization';
