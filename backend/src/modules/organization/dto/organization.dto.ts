import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

// ============================================
// ORGANIZATION DTOs
// ============================================

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsOptional()
  settings?: Record<string, any>;
}

export class OrganizationResponseDto {
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
}

export class OrganizationListResponseDto {
  organizations: OrganizationResponseDto[];
  total: number;
}

// ============================================
// MEMBER DTOs
// ============================================

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(OrganizationRole)
  @IsOptional()
  role?: OrganizationRole;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateMemberRoleDto {
  @IsUUID()
  user_id: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}

export class RemoveMemberDto {
  @IsUUID()
  user_id: string;
}

export class MemberResponseDto {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  invited_by?: string;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export class MemberListResponseDto {
  members: MemberResponseDto[];
  total: number;
}

// ============================================
// INVITATION DTOs
// ============================================

export class InvitationResponseDto {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
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

export class InvitationListResponseDto {
  invitations: InvitationResponseDto[];
  total: number;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;
}

export class AcceptInvitationResponseDto {
  success: boolean;
  message: string;
  organization_id: string;
  organization_name: string;
  role: OrganizationRole;
}

export class DeclineInvitationDto {
  @IsString()
  token: string;
}

export class ResendInvitationDto {
  @IsUUID()
  invitation_id: string;
}

export class CancelInvitationDto {
  @IsUUID()
  invitation_id: string;
}

// ============================================
// PUBLIC INVITATION DTOs (No auth required)
// ============================================

export class PublicInvitationResponseDto {
  email: string;
  role: OrganizationRole;
  organization_name: string;
  organization_logo?: string;
  inviter_name: string;
  expires_at: string;
  is_valid: boolean;
}

// ============================================
// ORGANIZATION CONTEXT DTOs
// ============================================

export class OrganizationContextDto {
  organization: OrganizationResponseDto;
  current_user_role: OrganizationRole;
  permissions: {
    can_invite: boolean;
    can_remove_members: boolean;
    can_update_roles: boolean;
    can_update_org: boolean;
    can_delete_org: boolean;
  };
}

// ============================================
// SLUG GENERATION
// ============================================

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
