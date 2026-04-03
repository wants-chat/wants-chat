import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UpdateUserDto,
  UserPreferencesDto,
  DeleteAccountDto,
  PublicUserProfileDto,
  UserPreferencesResponseDto,
  AvatarUploadResponseDto,
  MessageResponseDto,
  AppPreferencesDto,
  AppPreferencesResponseDto,
} from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================
  // CURRENT USER PROFILE ENDPOINTS
  // ============================================

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCurrentUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteCurrentUser(
    @Request() req,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.deleteAccount(req.user.sub, deleteAccountDto.password);
  }

  // ============================================
  // AVATAR MANAGEMENT ENDPOINTS
  // ============================================

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Please upload an image file');
    }

    return this.usersService.uploadAvatar(req.user.sub, file);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAvatar(@Request() req): Promise<MessageResponseDto> {
    return this.usersService.deleteAvatar(req.user.sub);
  }

  // ============================================
  // USER PREFERENCES ENDPOINTS
  // ============================================

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPreferences(@Request() req): Promise<UserPreferencesResponseDto> {
    return this.usersService.getPreferences(req.user.sub);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserPreferences(
    @Request() req,
    @Body() userPreferencesDto: UserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    return this.usersService.updatePreferences(req.user.sub, userPreferencesDto);
  }

  // ============================================
  // APP PREFERENCES ENDPOINTS
  // ============================================

  @Get('app-preferences')
  @ApiOperation({ summary: 'Get app preferences' })
  @ApiResponse({ status: 200, description: 'App preferences retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAppPreferences(@Request() req): Promise<AppPreferencesResponseDto> {
    const userId = req.user.sub || req.user.userId;
    return this.usersService.getAppPreferences(userId);
  }

  @Put('app-preferences')
  @ApiOperation({ summary: 'Update app preferences' })
  @ApiResponse({ status: 200, description: 'App preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAppPreferences(
    @Request() req,
    @Body() appPreferencesDto: AppPreferencesDto,
  ): Promise<AppPreferencesResponseDto> {
    const userId = req.user.sub || req.user.userId;
    return this.usersService.updateAppPreferences(userId, appPreferencesDto);
  }

  // ============================================
  // PUBLIC USER ENDPOINTS
  // ============================================

  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Request() req,
    @Param('id') userId: string,
  ): Promise<PublicUserProfileDto> {
    return this.usersService.getPublicProfile(userId);
  }
}
