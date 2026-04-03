import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  MemberResponseDto,
  InvitationResponseDto,
  AcceptInvitationResponseDto,
  PublicInvitationResponseDto,
  OrganizationRole,
  InvitationStatus,
  generateSlug,
} from './dto';

interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface MemberRecord {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  invited_by?: string;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface InvitationRecord {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by: string;
  token: string;
  status: InvitationStatus;
  message?: string;
  expires_at: Date;
  accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // ============================================
  // ORGANIZATION CRUD
  // ============================================

  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    // Generate unique slug
    let slug = generateSlug(dto.name);
    let slugExists = await this.db.findOne('organizations', { slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(dto.name)}-${counter}`;
      slugExists = await this.db.findOne('organizations', { slug });
      counter++;
    }

    // Create organization
    const org = await this.db.insert<OrganizationRecord>('organizations', {
      name: dto.name,
      slug,
      description: dto.description,
      logo_url: dto.logo_url,
      owner_id: userId,
      settings: {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Add owner as member
    await this.db.insert('organization_members', {
      organization_id: org.id,
      user_id: userId,
      role: OrganizationRole.OWNER,
      joined_at: new Date(),
    });

    return this.formatOrganizationResponse(org, OrganizationRole.OWNER, 1);
  }

  async getOrganization(
    orgId: string,
    userId?: string,
  ): Promise<OrganizationResponseDto | null> {
    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      id: orgId,
    });

    if (!org) return null;

    let currentUserRole: OrganizationRole | undefined;
    if (userId) {
      const member = await this.db.findOne<MemberRecord>(
        'organization_members',
        { organization_id: orgId, user_id: userId },
      );
      currentUserRole = member?.role;
    }

    const memberCount = await this.getMemberCount(orgId);
    return this.formatOrganizationResponse(org, currentUserRole, memberCount);
  }

  async getOrganizationBySlug(
    slug: string,
    userId?: string,
  ): Promise<OrganizationResponseDto | null> {
    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      slug,
    });

    if (!org) return null;

    return this.getOrganization(org.id, userId);
  }

  async getUserOrganizations(
    userId: string,
  ): Promise<OrganizationResponseDto[]> {
    const sql = `
      SELECT o.*, om.role as user_role
      FROM "organizations" o
      INNER JOIN "organization_members" om ON o.id = om.organization_id
      WHERE om.user_id = $1
      ORDER BY o.created_at DESC
    `;

    const result = await this.db.query<
      OrganizationRecord & { user_role: OrganizationRole }
    >(sql, [userId]);

    const orgs: OrganizationResponseDto[] = [];
    for (const row of result.rows) {
      const memberCount = await this.getMemberCount(row.id);
      orgs.push(this.formatOrganizationResponse(row, row.user_role, memberCount));
    }

    return orgs;
  }

  async updateOrganization(
    orgId: string,
    userId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    const updateData: Record<string, any> = {
      ...dto,
      updated_at: new Date(),
    };

    // Generate new slug if name changed
    if (dto.name) {
      let slug = generateSlug(dto.name);
      const existing = await this.db.findOne<OrganizationRecord>(
        'organizations',
        { slug },
      );
      if (existing && existing.id !== orgId) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    const [updated] = await this.db.update<OrganizationRecord>(
      'organizations',
      { id: orgId },
      updateData,
    );

    const member = await this.db.findOne<MemberRecord>('organization_members', {
      organization_id: orgId,
      user_id: userId,
    });
    const memberCount = await this.getMemberCount(orgId);

    return this.formatOrganizationResponse(updated, member?.role, memberCount);
  }

  async deleteOrganization(orgId: string, userId: string): Promise<boolean> {
    await this.checkPermission(orgId, userId, ['owner']);

    // Delete all members and invitations first
    await this.db.delete('organization_members', { organization_id: orgId });
    await this.db.delete('organization_invitations', { organization_id: orgId });
    await this.db.delete('organizations', { id: orgId });

    return true;
  }

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  async getMembers(
    orgId: string,
    userId: string,
  ): Promise<MemberResponseDto[]> {
    await this.checkMembership(orgId, userId);

    const sql = `
      SELECT om.*, u.email, u.name as first_name, u.username, u.avatar_url
      FROM "organization_members" om
      LEFT JOIN "users" u ON om.user_id = u.id
      WHERE om.organization_id = $1
      ORDER BY om.role, om.joined_at
    `;

    const result = await this.db.query<MemberRecord & {
      email: string;
      first_name?: string;
      username?: string;
      avatar_url?: string;
    }>(sql, [orgId]);

    return result.rows.map((row) => ({
      id: row.id,
      organization_id: row.organization_id,
      user_id: row.user_id,
      role: row.role,
      invited_by: row.invited_by,
      joined_at: row.joined_at.toISOString(),
      user: {
        id: row.user_id,
        email: row.email,
        first_name: row.first_name,
        username: row.username,
        avatar_url: row.avatar_url,
      },
    }));
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<MemberResponseDto> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    // Cannot change owner role
    const targetMember = await this.db.findOne<MemberRecord>(
      'organization_members',
      { organization_id: orgId, user_id: dto.user_id },
    );

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Only owner can assign admin
    if (dto.role === OrganizationRole.ADMIN) {
      await this.checkPermission(orgId, userId, ['owner']);
    }

    const [updated] = await this.db.update<MemberRecord>(
      'organization_members',
      { id: targetMember.id },
      { role: dto.role, updated_at: new Date() },
    );

    return {
      id: updated.id,
      organization_id: updated.organization_id,
      user_id: updated.user_id,
      role: updated.role,
      invited_by: updated.invited_by,
      joined_at: updated.joined_at.toISOString(),
    };
  }

  async removeMember(
    orgId: string,
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    const targetMember = await this.db.findOne<MemberRecord>(
      'organization_members',
      { organization_id: orgId, user_id: targetUserId },
    );

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot remove organization owner');
    }

    // Admin cannot remove other admins
    const requesterMember = await this.db.findOne<MemberRecord>(
      'organization_members',
      { organization_id: orgId, user_id: userId },
    );

    if (
      requesterMember?.role === OrganizationRole.ADMIN &&
      targetMember.role === OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.db.delete('organization_members', { id: targetMember.id });
    return true;
  }

  async leaveOrganization(orgId: string, userId: string): Promise<boolean> {
    const member = await this.db.findOne<MemberRecord>('organization_members', {
      organization_id: orgId,
      user_id: userId,
    });

    if (!member) {
      throw new NotFoundException('Not a member of this organization');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Owner cannot leave. Transfer ownership first or delete the organization.',
      );
    }

    await this.db.delete('organization_members', { id: member.id });
    return true;
  }

  // ============================================
  // INVITATIONS
  // ============================================

  async inviteMember(
    orgId: string,
    userId: string,
    dto: InviteMemberDto,
  ): Promise<InvitationResponseDto> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    // Check if already a member
    const existingMember = await this.db.query(
      `SELECT u.id FROM "users" u
       INNER JOIN "organization_members" om ON u.id = om.user_id
       WHERE u.email = $1 AND om.organization_id = $2`,
      [dto.email.toLowerCase(), orgId],
    );

    if (existingMember.rows.length > 0) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Check for pending invitation
    const existingInvite = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      {
        organization_id: orgId,
        email: dto.email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
    );

    if (existingInvite) {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await this.db.insert<InvitationRecord>(
      'organization_invitations',
      {
        organization_id: orgId,
        email: dto.email.toLowerCase(),
        role: dto.role || OrganizationRole.MEMBER,
        invited_by: userId,
        token,
        status: InvitationStatus.PENDING,
        message: dto.message,
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      },
    );

    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      id: orgId,
    });
    const inviter = await this.db.findUserById(userId);

    // Send invitation email (exactly like fluxez)
    await this.sendInvitationEmail(
      dto.email,
      invitation.token,
      org?.name || 'Organization',
      inviter?.name || inviter?.email || 'A team member',
      dto.role || OrganizationRole.MEMBER,
      dto.message,
    );

    return {
      id: invitation.id,
      organization_id: invitation.organization_id,
      email: invitation.email,
      role: invitation.role,
      invited_by: invitation.invited_by,
      status: invitation.status,
      expires_at: invitation.expires_at.toISOString(),
      created_at: invitation.created_at.toISOString(),
      organization: org
        ? {
            id: org.id,
            name: org.name,
            logo_url: org.logo_url,
          }
        : undefined,
      inviter: inviter
        ? {
            id: inviter.id,
            email: inviter.email,
            first_name: inviter.name,
          }
        : undefined,
    };
  }

  async getInvitationByToken(
    token: string,
  ): Promise<PublicInvitationResponseDto | null> {
    const invitation = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      { token },
    );

    if (!invitation) return null;

    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      id: invitation.organization_id,
    });
    const inviter = await this.db.findUserById(invitation.invited_by);

    const isValid =
      invitation.status === InvitationStatus.PENDING &&
      new Date() < new Date(invitation.expires_at);

    return {
      email: invitation.email,
      role: invitation.role,
      organization_name: org?.name || 'Unknown',
      organization_logo: org?.logo_url,
      inviter_name: inviter?.name || inviter?.email || 'Unknown',
      expires_at: invitation.expires_at.toISOString(),
      is_valid: isValid,
    };
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<AcceptInvitationResponseDto> {
    const invitation = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      { token },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has already been ${invitation.status}`,
      );
    }

    if (new Date() > new Date(invitation.expires_at)) {
      await this.db.update(
        'organization_invitations',
        { id: invitation.id },
        { status: InvitationStatus.EXPIRED, updated_at: new Date() },
      );
      throw new BadRequestException('Invitation has expired');
    }

    // Verify user email matches invitation
    const user = await this.db.findUserById(userId);
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );
    }

    // Check if already a member
    const existingMember = await this.db.findOne('organization_members', {
      organization_id: invitation.organization_id,
      user_id: userId,
    });

    if (existingMember) {
      throw new ConflictException('You are already a member of this organization');
    }

    // Add as member
    await this.db.insert('organization_members', {
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      joined_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Update invitation status
    await this.db.update(
      'organization_invitations',
      { id: invitation.id },
      {
        status: InvitationStatus.ACCEPTED,
        accepted_at: new Date(),
        updated_at: new Date(),
      },
    );

    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      id: invitation.organization_id,
    });

    return {
      success: true,
      message: `Successfully joined ${org?.name || 'organization'}`,
      organization_id: invitation.organization_id,
      organization_name: org?.name || 'Unknown',
      role: invitation.role,
    };
  }

  async declineInvitation(token: string): Promise<boolean> {
    const invitation = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      { token },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has already been ${invitation.status}`,
      );
    }

    await this.db.update(
      'organization_invitations',
      { id: invitation.id },
      { status: InvitationStatus.DECLINED, updated_at: new Date() },
    );

    return true;
  }

  async cancelInvitation(
    orgId: string,
    userId: string,
    invitationId: string,
  ): Promise<boolean> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    const invitation = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      { id: invitationId, organization_id: orgId },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.db.delete('organization_invitations', { id: invitationId });
    return true;
  }

  async resendInvitation(
    orgId: string,
    userId: string,
    invitationId: string,
  ): Promise<InvitationResponseDto> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    const invitation = await this.db.findOne<InvitationRecord>(
      'organization_invitations',
      { id: invitationId, organization_id: orgId },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [updated] = await this.db.update<InvitationRecord>(
      'organization_invitations',
      { id: invitationId },
      {
        token: newToken,
        status: InvitationStatus.PENDING,
        expires_at: expiresAt,
        updated_at: new Date(),
      },
    );

    const org = await this.db.findOne<OrganizationRecord>('organizations', {
      id: orgId,
    });
    const inviter = await this.db.findUserById(userId);

    // Resend invitation email (exactly like fluxez)
    await this.sendInvitationEmail(
      updated.email,
      newToken,
      org?.name || 'Organization',
      inviter?.name || inviter?.email || 'A team member',
      updated.role,
      invitation.message,
    );

    return {
      id: updated.id,
      organization_id: updated.organization_id,
      email: updated.email,
      role: updated.role,
      invited_by: updated.invited_by,
      status: updated.status,
      expires_at: updated.expires_at.toISOString(),
      created_at: updated.created_at.toISOString(),
      organization: org
        ? { id: org.id, name: org.name, logo_url: org.logo_url }
        : undefined,
      inviter: inviter
        ? { id: inviter.id, email: inviter.email, first_name: inviter.name }
        : undefined,
    };
  }

  async getPendingInvitations(
    orgId: string,
    userId: string,
  ): Promise<InvitationResponseDto[]> {
    await this.checkPermission(orgId, userId, ['owner', 'admin']);

    const invitations = await this.db.findMany<InvitationRecord>(
      'organization_invitations',
      { organization_id: orgId, status: InvitationStatus.PENDING },
      { orderBy: 'created_at', order: 'DESC' },
    );

    return invitations.map((inv) => ({
      id: inv.id,
      organization_id: inv.organization_id,
      email: inv.email,
      role: inv.role,
      invited_by: inv.invited_by,
      status: inv.status,
      expires_at: inv.expires_at.toISOString(),
      created_at: inv.created_at.toISOString(),
    }));
  }

  async getUserPendingInvitations(
    email: string,
  ): Promise<InvitationResponseDto[]> {
    const sql = `
      SELECT i.*, o.name as org_name, o.logo_url as org_logo,
             u.name as inviter_name, u.email as inviter_email
      FROM "organization_invitations" i
      LEFT JOIN "organizations" o ON i.organization_id = o.id
      LEFT JOIN "users" u ON i.invited_by = u.id
      WHERE i.email = $1 AND i.status = $2 AND i.expires_at > NOW()
      ORDER BY i.created_at DESC
    `;

    const result = await this.db.query<
      InvitationRecord & {
        org_name: string;
        org_logo?: string;
        inviter_name?: string;
        inviter_email: string;
      }
    >(sql, [email.toLowerCase(), InvitationStatus.PENDING]);

    return result.rows.map((row) => ({
      id: row.id,
      organization_id: row.organization_id,
      email: row.email,
      role: row.role,
      invited_by: row.invited_by,
      status: row.status,
      expires_at: row.expires_at.toISOString(),
      created_at: row.created_at.toISOString(),
      organization: {
        id: row.organization_id,
        name: row.org_name,
        logo_url: row.org_logo,
      },
      inviter: {
        id: row.invited_by,
        email: row.inviter_email,
        first_name: row.inviter_name,
      },
    }));
  }

  // ============================================
  // HELPERS
  // ============================================

  private async checkMembership(
    orgId: string,
    userId: string,
  ): Promise<MemberRecord> {
    const member = await this.db.findOne<MemberRecord>('organization_members', {
      organization_id: orgId,
      user_id: userId,
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this organization');
    }

    return member;
  }

  private async checkPermission(
    orgId: string,
    userId: string,
    allowedRoles: string[],
  ): Promise<MemberRecord> {
    const member = await this.checkMembership(orgId, userId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return member;
  }

  private async getMemberCount(orgId: string): Promise<number> {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM "organization_members" WHERE "organization_id" = $1',
      [orgId],
    );
    return parseInt(result.rows[0]?.count || '0', 10);
  }

  private formatOrganizationResponse(
    org: OrganizationRecord,
    currentUserRole?: OrganizationRole,
    memberCount?: number,
  ): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo_url: org.logo_url,
      owner_id: org.owner_id,
      settings: org.settings,
      created_at: org.created_at.toISOString(),
      updated_at: org.updated_at.toISOString(),
      member_count: memberCount,
      current_user_role: currentUserRole,
    };
  }

  /**
   * Send invitation email (copied from fluxez exactly)
   */
  private async sendInvitationEmail(
    email: string,
    token: string,
    organizationName: string,
    inviterName: string,
    role: string,
    message?: string,
  ): Promise<void> {
    try {
      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const inviteUrl = `${frontendUrl}/invite/${token}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #14b8a6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .message-box { background: #e0f2fe; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
              ${message ? `<div class="message-box"><p><strong>Message from ${inviterName}:</strong></p><p>${message}</p></div>` : ''}
              <p>Click the button below to accept the invitation:</p>
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #14b8a6;">${inviteUrl}</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>Powered by Wants</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: [email],
        from:
          this.configService.get('EMAIL_FROM') || 'noreply@widest.life',
        subject: `You've been invited to join ${organizationName}`,
        html,
      });

      this.logger.log(`Organization invitation sent to ${email}`);
    } catch (emailError) {
      this.logger.error(
        `Failed to send invitation email to ${email}`,
        emailError,
      );
      // Don't fail the invitation if email fails
    }
  }
}
