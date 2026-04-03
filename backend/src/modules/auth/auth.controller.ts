import { Controller, Post, Body, Get, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import * as multer from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto, RefreshTokenDto, PasswordResetRequestDto, PasswordResetConfirmDto, ChangePasswordDto, VerifyEmailDto, ResendEmailVerificationDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    // Pass the entire JWT payload which contains email, name, username
    return await this.authService.validateUser(req.user.sub, req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile details' })
  async getProfileDetails(@Request() req) {
    return await this.authService.getProfile(req.user.sub);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token using refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req) {
    return await this.authService.logout(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return await this.authService.updateProfile(req.user.sub, dto);
  }

  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profileImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadProfileImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.authService.uploadProfileImage(req.user.sub, file);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar', { storage: multer.memoryStorage() }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Please upload an image file');
    }

    return await this.authService.uploadAvatar(req.user.userId || req.user.sub, file);
  }

  // ==================== Password Management ====================

  @Post('password/reset-request')
  @ApiOperation({ summary: 'Request password reset email' })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return await this.authService.requestPasswordReset(dto);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return await this.authService.confirmPasswordReset(dto);
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.sub, dto);
  }

  // ==================== Email Verification ====================

  @Post('email/verify')
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto);
  }

  @Post('email/resend-verification')
  @ApiOperation({ summary: 'Resend email verification' })
  async resendEmailVerification(@Body() dto: ResendEmailVerificationDto) {
    return await this.authService.resendEmailVerification(dto);
  }

  // ==================== Account Management ====================

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account and all associated data' })
  async deleteAccount(@Request() req) {
    return await this.authService.deleteAccount(req.user.sub);
  }

  // ==================== OAuth Endpoints ====================

  private getFrontendUrl(req: any): string {
    const frontendUrl = req.query?.frontendUrl || req.query?.returnUrl;

    if (frontendUrl) {
      return frontendUrl;
    }

    return process.env.FRONTEND_URL || 'http://localhost:5174';
  }

  @Get('oauth/github')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow via Fluxez' })
  @ApiQuery({ name: 'frontendUrl', required: false, description: 'Frontend URL for redirect after auth' })
  async githubOAuth(@Request() req, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl(req);
    const authUrl = await this.authService.getGitHubAuthUrl(frontendUrl);
    return res.redirect(authUrl);
  }

  @Get('oauth/google')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate Google OAuth flow via Fluxez' })
  @ApiQuery({ name: 'frontendUrl', required: false, description: 'Frontend URL for redirect after auth' })
  async googleOAuth(@Request() req, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl(req);
    const authUrl = await this.authService.getGoogleAuthUrl(frontendUrl);
    return res.redirect(authUrl);
  }

  @Get('oauth/apple')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate Apple OAuth flow via Fluxez' })
  @ApiQuery({ name: 'frontendUrl', required: false, description: 'Frontend URL for redirect after auth' })
  async appleOAuth(@Request() req, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl(req);
    const authUrl = await this.authService.getAppleAuthUrl(frontendUrl);
    return res.redirect(authUrl);
  }

  // ==================== OAuth Callbacks ====================

  @Get('oauth/github/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubOAuthCallback(@Request() req, @Res() res: Response) {
    const { code, state } = req.query;
    const result = await this.authService.handleGitHubCallback(code as string, state as string);
    return res.redirect(result.redirectUrl);
  }

  @Get('oauth/google/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleOAuthCallback(@Request() req, @Res() res: Response) {
    const { code, state } = req.query;
    const result = await this.authService.handleGoogleCallback(code as string, state as string);
    return res.redirect(result.redirectUrl);
  }

  @Post('oauth/apple/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Apple OAuth callback (POST for form_post response mode)' })
  async appleOAuthCallback(@Request() req, @Res() res: Response) {
    const { code, state, user } = req.body;
    const result = await this.authService.handleAppleCallback(code, state, user ? JSON.parse(user) : undefined);
    return res.redirect(result.redirectUrl);
  }

  @Post('oauth/exchange')
  @ApiOperation({ summary: 'Exchange Fluxez token for session (pass through)' })
  async exchangeOAuthToken(@Body() dto: { fluxezToken: string; userId: string; email: string }) {
    return await this.authService.exchangeFluxezToken(dto.fluxezToken, dto.userId, dto.email);
  }
}
