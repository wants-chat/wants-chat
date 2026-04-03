/**
 * Organization Types for Wants
 * Defines interfaces for organization management, members, and invitations
 */

// Organization role types
export type OrganizationRole = 'owner' | 'admin' | 'member';

// Main organization interface
export interface Organization {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  settings?: OrganizationSettings;
}

// Organization settings
export interface OrganizationSettings {
  allowMemberInvites?: boolean;
  defaultMemberRole?: OrganizationRole;
  requireApproval?: boolean;
}

// Organization member interface
export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
  };
}

// Organization invitation status
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Organization invitation interface
export interface OrganizationInvitation {
  id: string;
  email: string;
  role: Exclude<OrganizationRole, 'owner'>; // Can't invite as owner
  status: InvitationStatus;
  token: string;
  message?: string;
  expiresAt: string;
  createdAt: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    logo?: string;
  };
  invitedBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// DTOs for API requests
export interface CreateOrganizationDto {
  name: string;
  description?: string;
  logo?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface InviteMemberDto {
  email: string;
  role: Exclude<OrganizationRole, 'owner'>;
  message?: string;
}

export interface UpdateMemberRoleDto {
  role: OrganizationRole;
}

// API response types
export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
}

export interface MembersListResponse {
  members: OrganizationMember[];
  total: number;
}

export interface InvitationsListResponse {
  invitations: OrganizationInvitation[];
  total: number;
}

export interface InvitationResponse {
  success: boolean;
  message?: string;
  invitation?: OrganizationInvitation;
}

export interface GenericResponse {
  success: boolean;
  message?: string;
}
