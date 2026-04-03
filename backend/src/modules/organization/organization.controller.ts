import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  AcceptInvitationDto,
  DeclineInvitationDto,
  ResendInvitationDto,
  CancelInvitationDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; userId?: string; email?: string };
}

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ============================================
  // ORGANIZATION CRUD
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrganizationDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.createOrganization(
      userId,
      dto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization created successfully',
      data: result,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrganizations(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.getUserOrganizations(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Organizations retrieved',
      data: { organizations: result, total: result.length },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrganization(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.getOrganization(id, userId);

    if (!result) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Organization not found',
        data: null,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved',
      data: result,
    };
  }

  @Get('slug/:slug')
  @UseGuards(JwtAuthGuard)
  async getOrganizationBySlug(
    @Req() req: AuthenticatedRequest,
    @Param('slug') slug: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.getOrganizationBySlug(
      slug,
      userId,
    );

    if (!result) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Organization not found',
        data: null,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved',
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrganization(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.updateOrganization(
      id,
      userId,
      dto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization updated',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteOrganization(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    await this.organizationService.deleteOrganization(id, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization deleted',
      data: { success: true },
    };
  }

  // ============================================
  // MEMBERS
  // ============================================

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async getMembers(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.getMembers(id, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Members retrieved',
      data: { members: result, total: result.length },
    };
  }

  @Patch(':id/members/role')
  @UseGuards(JwtAuthGuard)
  async updateMemberRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.updateMemberRole(
      id,
      userId,
      dto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Member role updated',
      data: result,
    };
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    await this.organizationService.removeMember(id, userId, targetUserId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Member removed',
      data: { success: true },
    };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveOrganization(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    await this.organizationService.leaveOrganization(id, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Left organization',
      data: { success: true },
    };
  }

  // ============================================
  // INVITATIONS
  // ============================================

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard)
  async inviteMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.inviteMember(id, userId, dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Invitation sent',
      data: result,
    };
  }

  @Get(':id/invitations')
  @UseGuards(JwtAuthGuard)
  async getPendingInvitations(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.getPendingInvitations(
      id,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitations retrieved',
      data: { invitations: result, total: result.length },
    };
  }

  @Post(':id/invitations/:invitationId/resend')
  @UseGuards(JwtAuthGuard)
  async resendInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.resendInvitation(
      id,
      userId,
      invitationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitation resent',
      data: result,
    };
  }

  @Delete(':id/invitations/:invitationId')
  @UseGuards(JwtAuthGuard)
  async cancelInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    await this.organizationService.cancelInvitation(id, userId, invitationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitation cancelled',
      data: { success: true },
    };
  }

  // ============================================
  // PUBLIC INVITATION ENDPOINTS (No auth for viewing)
  // ============================================

  @Get('invitations/token/:token')
  async getInvitationByToken(@Param('token') token: string) {
    const result = await this.organizationService.getInvitationByToken(token);

    if (!result) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Invitation not found',
        data: null,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitation retrieved',
      data: result,
    };
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AcceptInvitationDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.organizationService.acceptInvitation(
      dto.token,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  @Post('invitations/decline')
  async declineInvitation(@Body() dto: DeclineInvitationDto) {
    await this.organizationService.declineInvitation(dto.token);

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitation declined',
      data: { success: true },
    };
  }

  // User's pending invitations
  @Get('my/invitations')
  @UseGuards(JwtAuthGuard)
  async getMyPendingInvitations(@Req() req: AuthenticatedRequest) {
    const email = req.user.email;
    if (!email) {
      return {
        statusCode: HttpStatus.OK,
        message: 'No invitations',
        data: { invitations: [], total: 0 },
      };
    }

    const result =
      await this.organizationService.getUserPendingInvitations(email);

    return {
      statusCode: HttpStatus.OK,
      message: 'Invitations retrieved',
      data: { invitations: result, total: result.length },
    };
  }
}
