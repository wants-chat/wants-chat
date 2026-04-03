import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import {
  ALL_APP_TYPES,
  getAppTypeById,
  searchAppTypes,
} from '../registries/app-types/index';
import {
  ALL_FEATURES,
  getFeatureById,
  getFeaturesForAppType,
  getFeaturesByKeyword,
} from '../registries/features/index';
import {
  ALL_COMPONENTS,
  getComponentById,
  getComponentsByCategory,
  getComponentsForSection,
  searchComponents,
} from '../registries/components/index';
import { AuthGuard } from '../../../common/guards/auth.guard';

@ApiTags('registry')
@Controller('registry')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RegistryController {
  // ============================================
  // App Types
  // ============================================

  @Get('app-types')
  @ApiOperation({ summary: 'List all available app types' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'detailed', required: false, description: 'Return full details', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of app types' })
  getAppTypes(
    @Query('search') search?: string,
    @Query('detailed') detailed?: string,
  ) {
    let appTypes = ALL_APP_TYPES;

    if (search) {
      appTypes = searchAppTypes(search);
    }

    if (detailed === 'true') {
      return {
        success: true,
        count: appTypes.length,
        data: appTypes,
      };
    }

    return {
      success: true,
      count: appTypes.length,
      data: appTypes.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        keywords: a.keywords.slice(0, 5),
      })),
    };
  }

  @Get('app-types/:id')
  @ApiOperation({ summary: 'Get a specific app type' })
  @ApiParam({ name: 'id', description: 'App type ID' })
  @ApiResponse({ status: 200, description: 'App type details' })
  @ApiResponse({ status: 404, description: 'App type not found' })
  getAppType(@Param('id') id: string) {
    const appType = getAppTypeById(id);

    if (!appType) {
      return { success: false, error: 'App type not found' };
    }

    const features = getFeaturesForAppType(id);

    return {
      success: true,
      data: {
        ...appType,
        availableFeatures: features.map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          enabledByDefault: f.enabledByDefault,
        })),
      },
    };
  }

  // ============================================
  // Features
  // ============================================

  @Get('features')
  @ApiOperation({ summary: 'List all available features' })
  @ApiQuery({ name: 'appType', required: false, description: 'Filter by app type' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Filter by keyword' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'detailed', required: false, description: 'Return full details', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of features' })
  getFeatures(
    @Query('appType') appType?: string,
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('detailed') detailed?: string,
  ) {
    let features = ALL_FEATURES;

    if (appType) {
      features = getFeaturesForAppType(appType);
    }

    if (keyword) {
      features = getFeaturesByKeyword(keyword);
    }

    if (category) {
      features = features.filter((f) => f.category === category);
    }

    if (detailed === 'true') {
      return {
        success: true,
        count: features.length,
        data: features,
      };
    }

    return {
      success: true,
      count: features.length,
      data: features.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        description: f.description,
        enabledByDefault: f.enabledByDefault,
        optional: f.optional,
      })),
    };
  }

  @Get('features/:id')
  @ApiOperation({ summary: 'Get a specific feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature details' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  getFeature(@Param('id') id: string) {
    const feature = getFeatureById(id);

    if (!feature) {
      return { success: false, error: 'Feature not found' };
    }

    return {
      success: true,
      data: feature,
    };
  }

  // ============================================
  // Components
  // ============================================

  @Get('components')
  @ApiOperation({ summary: 'List all available components' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'section', required: false, description: 'Filter by section (frontend, admin, vendor)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'detailed', required: false, description: 'Return full details', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of components' })
  getComponents(
    @Query('category') category?: string,
    @Query('section') section?: string,
    @Query('search') search?: string,
    @Query('detailed') detailed?: string,
  ) {
    let components = ALL_COMPONENTS;

    if (category) {
      components = getComponentsByCategory(category);
    }

    if (section) {
      components = getComponentsForSection(section as any);
    }

    if (search) {
      components = searchComponents(search);
    }

    if (detailed === 'true') {
      return {
        success: true,
        count: components.length,
        data: components,
      };
    }

    return {
      success: true,
      count: components.length,
      data: components.map((comp) => ({
        id: comp.id,
        name: comp.name,
        category: comp.category,
        description: comp.description,
        allowedIn: comp.allowedIn,
        fieldCount: comp.requiredFields.length + comp.optionalFields.length,
      })),
    };
  }

  @Get('components/:id')
  @ApiOperation({ summary: 'Get a specific component' })
  @ApiParam({ name: 'id', description: 'Component ID' })
  @ApiResponse({ status: 200, description: 'Component details' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  getComponent(@Param('id') id: string) {
    const component = getComponentById(id);

    if (!component) {
      return { success: false, error: 'Component not found' };
    }

    return {
      success: true,
      data: component,
    };
  }

  // ============================================
  // Summary
  // ============================================

  @Get('summary')
  @ApiOperation({ summary: 'Get a summary of all registries' })
  @ApiResponse({ status: 200, description: 'Registry summary' })
  getSummary() {
    return {
      success: true,
      data: {
        appTypes: {
          count: ALL_APP_TYPES.length,
          ids: ALL_APP_TYPES.map((a) => a.id),
        },
        features: {
          count: ALL_FEATURES.length,
          byCategory: {
            security: ALL_FEATURES.filter((f) => f.category === 'security').length,
            commerce: ALL_FEATURES.filter((f) => f.category === 'commerce').length,
            content: ALL_FEATURES.filter((f) => f.category === 'content').length,
            utility: ALL_FEATURES.filter((f) => f.category === 'utility').length,
          },
        },
        components: {
          count: ALL_COMPONENTS.length,
          byCategory: {
            form: ALL_COMPONENTS.filter((c) => c.category === 'form').length,
            navigation: ALL_COMPONENTS.filter((c) => c.category === 'navigation').length,
            'data-display': ALL_COMPONENTS.filter((c) => c.category === 'data-display').length,
            ecommerce: ALL_COMPONENTS.filter((c) => c.category === 'ecommerce').length,
          },
        },
      },
    };
  }
}
