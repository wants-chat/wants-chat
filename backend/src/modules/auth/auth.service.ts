import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService, User } from '../database/database.service';
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendEmailVerificationDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { R2Service } from '../storage/r2.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => R2Service)) private r2Service: R2Service,
  ) {}

  // ============================================
  // Token Generation
  // ============================================

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d') },
    );

    return { accessToken, refreshToken };
  }

  // ============================================
  // Registration
  // ============================================

  async register(dto: RegisterDto) {
    try {
      this.logger.log(`Registration attempt for ${dto.email}`);

      // Check if user already exists
      const existingUser = await this.db.findUserByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('An account with this email already exists');
      }

      // Create user
      const user = await this.db.createUser({
        email: dto.email,
        password: dto.password,
        name: dto.name,
        username: dto.username,
        metadata: {},
      });

      // Create default user settings
      await this.createDefaultUserSettings(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      this.logger.log(`User registered successfully: ${user.id}`);

      return {
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          emailVerified: user.email_verified,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        requiresVerification: !user.email_verified,
      };
    } catch (error) {
      this.logger.error('Registration failed', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  // ============================================
  // Login
  // ============================================

  async login(dto: LoginDto) {
    try {
      // Find user by email
      const user = await this.db.findUserByEmail(dto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user has a password (might be OAuth-only user)
      if (!user.password_hash) {
        throw new UnauthorizedException(
          'This account uses social login. Please sign in with your social provider.',
        );
      }

      // Validate password
      const isValid = await this.db.validatePassword(
        dto.password,
        user.password_hash,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Update last login
      await this.db.updateUserLastLogin(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      // Ensure user has settings
      await this.ensureUserSettings(user.id);

      this.logger.log(`User logged in: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          avatar_url: user.avatar_url,
          profileImage: user.avatar_url,
          bio: user.bio,
          location: user.location,
          website: user.website,
          phone: user.phone,
          emailVerified: user.email_verified,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error('Login failed', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid email or password');
    }
  }

  // ============================================
  // Profile Management
  // ============================================

  async getProfile(userId: string) {
    try {
      const user = await this.db.findUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        location: user.location,
        website: user.website,
        phone: user.phone,
        avatar_url: user.avatar_url,
        avatarUrl: user.avatar_url,
        profileImage: user.avatar_url,
        email_verified: user.email_verified,
        createdAt: user.created_at,
        lastSignIn: user.last_login_at,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve profile');
    }
  }

  async validateUser(userId: string, jwtPayload?: any) {
    try {
      const user = await this.db.findUserById(userId);

      if (!user) {
        return {
          user: {
            id: userId,
            email: jwtPayload?.email || null,
            name: jwtPayload?.name || null,
            username: jwtPayload?.username || null,
            avatarUrl: null,
            profileImage: null,
            avatar_url: null,
            createdAt: new Date().toISOString(),
            role: 'user',
          },
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          profileImage: user.avatar_url,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          website: user.website,
          phone: user.phone,
          email_verified: user.email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
          createdAt: user.created_at,
          role: 'user',
        },
      };
    } catch (error) {
      this.logger.error('Validate user error:', error);
      return {
        user: {
          id: userId,
          email: jwtPayload?.email || null,
          name: jwtPayload?.name || null,
          username: jwtPayload?.username || null,
          profileImage: null,
          createdAt: new Date().toISOString(),
          role: 'user',
        },
      };
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      this.logger.log(`Updating profile for user ${userId}`);

      const updateData: any = {
        updated_at: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.countryCode !== undefined)
        updateData.country_code = data.countryCode;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

      await this.db.update('users', { id: userId }, updateData);

      // Fetch updated user
      const user = await this.db.findUserById(userId);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: userId,
          email: user?.email,
          name: user?.name,
          username: user?.username,
          website: user?.website,
          bio: user?.bio,
          phone: user?.phone,
          countryCode: user?.country_code,
          location: user?.location,
          avatarUrl: user?.avatar_url,
          profileImage: user?.avatar_url,
        },
      };
    } catch (error) {
      this.logger.error('Profile update error:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    try {
      this.logger.log(`Processing profile image upload for user ${userId}`);

      // For now, we'll store the image as base64 or you can integrate with a storage service
      // In production, you'd want to use S3, Cloudinary, or similar
      const avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Update user with new avatar URL
      await this.db.update(
        'users',
        { id: userId },
        { avatar_url: avatarUrl, updated_at: new Date() },
      );

      return {
        success: true,
        profileImage: avatarUrl,
        avatarUrl: avatarUrl,
        fileName: file.originalname,
      };
    } catch (error) {
      this.logger.error('Profile image upload error:', error);
      throw new InternalServerErrorException('Failed to upload profile image');
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    try {
      this.logger.log(`Processing avatar upload for user ${userId}`);

      const user = await this.db.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Upload to R2 storage
      const uploadResult = await this.r2Service.uploadFile(file, userId, {
        path: 'avatars',
        isPublic: true,
        metadata: {
          type: 'avatar',
          userId,
        },
      });

      const avatarUrl = uploadResult.url;

      // Update user with new avatar URL
      await this.db.update(
        'users',
        { id: userId },
        { avatar_url: avatarUrl, updated_at: new Date() },
      );

      this.logger.log(`Avatar uploaded for user: ${userId}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: avatarUrl,
        },
      };
    } catch (error) {
      this.logger.error('Avatar upload error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  // ============================================
  // Token Management
  // ============================================

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if refresh token exists in database
      const storedToken = await this.db.findOne('refresh_tokens', {
        token: refreshToken,
        user_id: payload.sub,
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (new Date() > new Date(storedToken.expires_at)) {
        await this.db.delete('refresh_tokens', { id: storedToken.id });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Get user
      const user = await this.db.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Delete old refresh token
      await this.db.delete('refresh_tokens', { id: storedToken.id });

      // Store new refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async logout(userId: string) {
    try {
      // Delete all refresh tokens for user
      await this.db.delete('refresh_tokens', { user_id: userId });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout error:', error);
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.db.insert('refresh_tokens', {
      user_id: userId,
      token: token,
      expires_at: expiresAt,
      created_at: new Date(),
    });
  }

  // ============================================
  // Password Management
  // ============================================

  async requestPasswordReset(dto: PasswordResetRequestDto) {
    try {
      const token = await this.db.createPasswordResetToken(dto.email);

      if (token) {
        // TODO: Send password reset email
        // For now, just log it
        this.logger.log(`Password reset token created for ${dto.email}`);
      }

      // Always return success to prevent email enumeration
      return {
        success: true,
        message:
          'If the email exists in our system, you will receive password reset instructions.',
      };
    } catch (error) {
      this.logger.error('Password reset request error:', error);
      return {
        success: true,
        message:
          'If the email exists in our system, you will receive password reset instructions.',
      };
    }
  }

  async confirmPasswordReset(dto: PasswordResetConfirmDto) {
    try {
      const success = await this.db.resetPassword(dto.token, dto.password);

      if (!success) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      this.logger.error('Password reset confirmation error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to reset password');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const success = await this.db.changePassword(
        userId,
        dto.currentPassword,
        dto.newPassword,
      );

      if (!success) {
        throw new BadRequestException('Current password is incorrect');
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      this.logger.error('Change password error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  // ============================================
  // Email Verification
  // ============================================

  async verifyEmail(dto: VerifyEmailDto) {
    try {
      const user = await this.db.verifyUserEmail(dto.token);

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      this.logger.error('Email verification error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify email');
    }
  }

  async resendEmailVerification(dto: ResendEmailVerificationDto) {
    try {
      const user = await this.db.findUserByEmail(dto.email);

      if (user && !user.email_verified) {
        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        );

        await this.db.updateUser(user.id, {
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpires,
        });

        // TODO: Send verification email
        this.logger.log(`Verification email resent to ${dto.email}`);
      }

      return {
        success: true,
        message:
          'If the email exists in our system and is not already verified, you will receive verification instructions.',
      };
    } catch (error) {
      this.logger.error('Resend email verification error:', error);
      return {
        success: true,
        message:
          'If the email exists in our system and is not already verified, you will receive verification instructions.',
      };
    }
  }

  // ============================================
  // OAuth
  // ============================================

  private generateOAuthState(frontendUrl?: string): string {
    const randomState = crypto.randomBytes(16).toString('hex');
    const stateData = frontendUrl ? `${randomState}|${frontendUrl}` : randomState;
    return Buffer.from(stateData).toString('base64');
  }

  parseOAuthState(state: string): { randomState: string; frontendUrl?: string } {
    try {
      const decoded = Buffer.from(state, 'base64').toString();
      const parts = decoded.split('|');
      return {
        randomState: parts[0],
        frontendUrl: parts[1] || undefined,
      };
    } catch {
      return { randomState: state };
    }
  }

  async getGitHubAuthUrl(frontendUrl: string): Promise<string> {
    const clientId = this.configService.get('GITHUB_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('GitHub OAuth is not configured');
    }

    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI', 'https://api.wants.chat/api/v1/auth/oauth/github/callback');
    const state = this.generateOAuthState(frontendUrl);

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;
  }

  async getGoogleAuthUrl(frontendUrl: string): Promise<string> {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI', 'https://api.wants.chat/api/v1/auth/oauth/google/callback');
    const state = this.generateOAuthState(frontendUrl);

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&state=${state}&access_type=offline&prompt=consent`;
  }

  async getAppleAuthUrl(frontendUrl: string): Promise<string> {
    const clientId = this.configService.get('APPLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Apple OAuth is not configured');
    }

    const redirectUri = this.configService.get<string>('APPLE_REDIRECT_URI', 'https://api.wants.chat/api/v1/auth/oauth/apple/callback');
    const state = this.generateOAuthState(frontendUrl);

    return `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=name%20email&state=${state}&response_mode=form_post`;
  }

  async handleGitHubCallback(code: string, state: string): Promise<{ redirectUrl: string }> {
    try {
      const { frontendUrl } = this.parseOAuthState(state);

      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
          client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new BadRequestException(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`);
      }

      const { access_token } = tokenData;

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new BadRequestException('Failed to fetch user data from GitHub');
      }

      const githubUser = await userResponse.json();

      // Get user email if not public
      let email = githubUser.email;
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        });

        if (emailResponse.ok) {
          const emails = await emailResponse.json();
          const primaryEmail = emails.find((e: any) => e.primary);
          email = primaryEmail?.email || emails[0]?.email;
        }
      }

      if (!email) {
        throw new BadRequestException('Unable to retrieve email from GitHub');
      }

      // Find or create OAuth user
      const user = await this.db.findOrCreateOAuthUser({
        email,
        name: githubUser.name,
        avatar_url: githubUser.avatar_url,
        oauth_provider: 'github',
        oauth_id: githubUser.id.toString(),
      });

      await this.ensureUserSettings(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);
      await this.storeRefreshToken(user.id, refreshToken);

      // Redirect to frontend with tokens
      const baseUrl = frontendUrl || this.configService.get('FRONTEND_URL', 'https://wants.chat');
      const redirectUrl = `${baseUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;

      return { redirectUrl };
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error);
      const frontendUrl = this.configService.get('FRONTEND_URL', 'https://wants.chat');
      return { redirectUrl: `${frontendUrl}/login?error=oauth_failed` };
    }
  }

  async handleGoogleCallback(code: string, state: string): Promise<{ redirectUrl: string }> {
    try {
      const { frontendUrl } = this.parseOAuthState(state);

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI', 'https://api.wants.chat/api/v1/auth/oauth/google/callback'),
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new BadRequestException(`Google OAuth error: ${tokenData.error_description || tokenData.error}`);
      }

      const { access_token } = tokenData;

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new BadRequestException('Failed to fetch user data from Google');
      }

      const googleUser = await userResponse.json();

      // Find or create OAuth user
      const user = await this.db.findOrCreateOAuthUser({
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
        oauth_provider: 'google',
        oauth_id: googleUser.id,
      });

      await this.ensureUserSettings(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);
      await this.storeRefreshToken(user.id, refreshToken);

      // Redirect to frontend with tokens
      const baseUrl = frontendUrl || this.configService.get('FRONTEND_URL', 'https://wants.chat');
      const redirectUrl = `${baseUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;

      return { redirectUrl };
    } catch (error) {
      this.logger.error('Google OAuth callback error:', error);
      const frontendUrl = this.configService.get('FRONTEND_URL', 'https://wants.chat');
      return { redirectUrl: `${frontendUrl}/login?error=oauth_failed` };
    }
  }

  async handleAppleCallback(code: string, state: string, idToken?: any): Promise<{ redirectUrl: string }> {
    try {
      const { frontendUrl } = this.parseOAuthState(state);

      // Generate client secret JWT for Apple
      const clientSecret = this.generateAppleClientSecret();

      // Exchange code for access token
      const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.configService.get<string>('APPLE_CLIENT_ID'),
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.configService.get<string>('APPLE_REDIRECT_URI', 'https://api.wants.chat/api/v1/auth/oauth/apple/callback'),
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new BadRequestException(`Apple OAuth error: ${tokenData.error_description || tokenData.error}`);
      }

      // Decode the ID token to get user info
      const decodedToken = this.jwtService.decode(tokenData.id_token) as any;

      if (!decodedToken) {
        throw new BadRequestException('Failed to decode Apple ID token');
      }

      const email = decodedToken.email;
      const appleUserId = decodedToken.sub;

      if (!email) {
        throw new BadRequestException('Unable to retrieve email from Apple');
      }

      // Find or create OAuth user
      const user = await this.db.findOrCreateOAuthUser({
        email,
        name: idToken?.user?.name ? `${idToken.user.name.firstName} ${idToken.user.name.lastName}` : email.split('@')[0],
        oauth_provider: 'apple',
        oauth_id: appleUserId,
      });

      await this.ensureUserSettings(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);
      await this.storeRefreshToken(user.id, refreshToken);

      // Redirect to frontend with tokens
      const baseUrl = frontendUrl || this.configService.get('FRONTEND_URL', 'https://wants.chat');
      const redirectUrl = `${baseUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;

      return { redirectUrl };
    } catch (error) {
      this.logger.error('Apple OAuth callback error:', error);
      const frontendUrl = this.configService.get('FRONTEND_URL', 'https://wants.chat');
      return { redirectUrl: `${frontendUrl}/login?error=oauth_failed` };
    }
  }

  private generateAppleClientSecret(): string {
    const jwt = require('jsonwebtoken');

    const teamId = this.configService.get<string>('APPLE_TEAM_ID');
    const clientId = this.configService.get<string>('APPLE_CLIENT_ID');
    const keyId = this.configService.get<string>('APPLE_KEY_ID');
    let privateKey = this.configService.get<string>('APPLE_PRIVATE_KEY');

    // Handle escaped newlines in private key
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: teamId,
      iat: now,
      exp: now + 15777000, // 6 months
      aud: 'https://appleid.apple.com',
      sub: clientId,
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    });
  }

  async exchangeFluxezToken(
    fluxezToken: string,
    userId: string,
    email: string,
  ) {
    try {
      this.logger.log(`Processing OAuth for user: ${email}`);

      // Find or create OAuth user
      const user = await this.db.findOrCreateOAuthUser({
        email,
        oauth_provider: 'oauth',
        oauth_id: userId,
      });

      await this.ensureUserSettings(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);
      await this.storeRefreshToken(user.id, refreshToken);

      return {
        token: accessToken,
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        },
      };
    } catch (error) {
      this.logger.error('Failed to process OAuth token:', error);
      throw new BadRequestException('OAuth processing failed');
    }
  }

  // ============================================
  // User Settings
  // ============================================

  private async createDefaultUserSettings(userId: string) {
    try {
      const existingSettings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      if (existingSettings) {
        return;
      }

      const defaultNotifications = {
        push: true,
        email: true,
        inApp: true,
        marketing: false,
      };

      await this.db.insert('user_settings', {
        user_id: userId,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/dd/yyyy',
        time_format: '12h',
        notifications: defaultNotifications,
        privacy: {},
        dashboard_layout: {},
        sidebar_collapsed: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.logger.log(`Created default user settings for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create default user settings for user ${userId}:`,
        error,
      );
    }
  }

  private async ensureUserSettings(userId: string) {
    try {
      const existingSettings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      if (!existingSettings) {
        await this.createDefaultUserSettings(userId);
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure user settings for user ${userId}:`,
        error,
      );
    }
  }

  // ============================================
  // Account Deletion
  // ============================================

  async deleteAccount(userId: string) {
    try {
      this.logger.log(`Starting account deletion for user ${userId}`);

      // Delete user data from various tables
      const userDataTables = [
        'user_settings',
        'messages',
        'conversations',
        'refresh_tokens',
      ];

      for (const table of userDataTables) {
        try {
          await this.db.delete(table, { user_id: userId });
        } catch (error) {
          this.logger.warn(
            `Table ${table} might not exist or delete failed:`,
            error.message,
          );
        }
      }

      // Delete the user
      await this.db.deleteUser(userId);

      this.logger.log(`Successfully deleted account for user ${userId}`);

      return {
        message:
          'Account successfully deleted. All your data has been permanently removed.',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to delete account for user ${userId}:`, error);
      throw new InternalServerErrorException(
        'Failed to delete account. Please try again or contact support.',
      );
    }
  }
}
