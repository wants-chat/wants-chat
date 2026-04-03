import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  UpdateUserDto,
  UserPreferencesDto,
  UserQueryDto,
  MessageResponseDto,
  UserPreferencesResponseDto,
  PublicUserProfileDto,
  AppPreferencesDto,
  AppPreferencesResponseDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  // ============================================
  // USER PROFILE MANAGEMENT
  // ============================================

  async getCurrentUser(userId: string) {
    try {
      const user = await this.db.findUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Calculate profile completion percentage
      const profileFields = [
        user.name,
        user.username,
        user.bio,
        user.location,
        user.website,
        user.avatar_url,
        user.phone,
      ];
      const filledFields = profileFields.filter(
        (field) => field !== null && field !== undefined && field !== '',
      ).length;
      const profileCompletion = Math.round(
        (filledFields / profileFields.length) * 100,
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        phone: user.phone,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        last_login_at: user.last_login_at,
        bio: user.bio,
        location: user.location,
        website: user.website,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile_completion: profileCompletion,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'Failed to retrieve user profile: ' + error.message,
      );
    }
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    try {
      const updateData: any = { updated_at: new Date() };

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.website !== undefined) updateData.website = dto.website;
      if (dto.phone !== undefined) updateData.phone = dto.phone;

      await this.db.update('users', { id: userId }, updateData);

      return await this.getCurrentUser(userId);
    } catch (error) {
      throw new BadRequestException(
        'Failed to update profile: ' + error.message,
      );
    }
  }

  async deleteAccount(userId: string, password: string): Promise<MessageResponseDto> {
    return {
      message:
        'Account deletion must be performed through authentication service.',
    };
  }

  // ============================================
  // AVATAR MANAGEMENT
  // ============================================

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    try {
      // Store as base64 (in production, use S3/Cloudinary)
      const avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      await this.db.update(
        'users',
        { id: userId },
        { avatar_url: avatarUrl, updated_at: new Date() },
      );

      return {
        avatar_url: avatarUrl,
        message: 'Avatar uploaded successfully',
        size: file.size,
        contentType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to upload avatar: ' + error.message,
      );
    }
  }

  async deleteAvatar(userId: string): Promise<MessageResponseDto> {
    try {
      await this.db.update(
        'users',
        { id: userId },
        { avatar_url: null, updated_at: new Date() },
      );

      return { message: 'Avatar deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        'Failed to delete avatar: ' + error.message,
      );
    }
  }

  // ============================================
  // PREFERENCES MANAGEMENT
  // ============================================

  async getPreferences(userId: string) {
    try {
      const settings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      if (!settings) {
        return {
          preferences: this.getDefaultPreferences(),
          timezone: 'UTC',
          language: 'en',
        };
      }

      return {
        preferences: settings.notifications || this.getDefaultPreferences(),
        timezone: settings.timezone || 'UTC',
        language: settings.language || 'en',
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to get preferences: ' + error.message,
      );
    }
  }

  async updatePreferences(
    userId: string,
    dto: UserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    try {
      let settings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      const updateData = {
        theme: dto.theme || 'light',
        language: dto.language || 'en',
        timezone: dto.timezone || 'UTC',
        notifications: dto.notifications || {},
        updated_at: new Date(),
      };

      if (settings) {
        await this.db.update('user_settings', { user_id: userId }, updateData);
      } else {
        await this.db.insert('user_settings', {
          user_id: userId,
          ...updateData,
          created_at: new Date(),
        });
      }

      return await this.getPreferences(userId);
    } catch (error) {
      throw new BadRequestException(
        'Failed to update preferences: ' + error.message,
      );
    }
  }

  // ============================================
  // PUBLIC PROFILES
  // ============================================

  async getPublicProfile(userId: string): Promise<PublicUserProfileDto> {
    try {
      const user = await this.db.findUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        username: user.username,
        full_name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        location: user.location,
        website: user.website,
        created_at: user.created_at?.toISOString() || new Date().toISOString(),
        is_own_profile: false,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'Failed to retrieve public profile: ' + error.message,
      );
    }
  }

  async searchUsers(query: UserQueryDto) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    return {
      data: [],
      message: 'User search is currently disabled',
      total: 0,
      page,
      limit,
      total_pages: 0,
    };
  }

  // ============================================
  // APP PREFERENCES
  // ============================================

  async getAppPreferences(userId: string): Promise<AppPreferencesResponseDto> {
    try {
      const settings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      if (!settings) {
        return {
          selectedApps: [],
          appOnboardingCompleted: false,
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        selectedApps: settings.selected_apps || [],
        appOnboardingCompleted: settings.app_onboarding_completed || false,
        updatedAt: settings.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to get app preferences: ' + error.message,
      );
    }
  }

  async updateAppPreferences(
    userId: string,
    dto: AppPreferencesDto,
  ): Promise<AppPreferencesResponseDto> {
    try {
      const now = new Date();

      let settings = await this.db.findOne('user_settings', {
        user_id: userId,
      });

      const updateData = {
        selected_apps: dto.selectedApps || [],
        app_onboarding_completed: dto.appOnboardingCompleted ?? true,
        updated_at: now,
      };

      if (settings) {
        await this.db.update('user_settings', { user_id: userId }, updateData);
      } else {
        await this.db.insert('user_settings', {
          user_id: userId,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {},
          ...updateData,
          created_at: now,
        });
      }

      return {
        selectedApps: dto.selectedApps || [],
        appOnboardingCompleted: dto.appOnboardingCompleted ?? true,
        updatedAt: now.toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to update app preferences: ' + error.message,
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getDefaultPreferences(): UserPreferencesDto {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        in_app: true,
      },
      privacy: {
        profile_visibility: 'public',
        show_activity: true,
        show_stats: true,
      },
      features: {},
    };
  }
}
