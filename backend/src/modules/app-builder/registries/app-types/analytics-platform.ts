/**
 * Analytics Platform App Type Definition
 *
 * Complete definition for analytics platform applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANALYTICS_PLATFORM_APP_TYPE: AppTypeDefinition = {
  id: 'analytics-platform',
  name: 'Analytics Platform',
  category: 'services',
  description: 'Analytics Platform platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "analytics platform",
      "analytics",
      "platform",
      "analytics software",
      "analytics app",
      "analytics system",
      "analytics management",
      "services analytics"
  ],

  synonyms: [
      "Analytics Platform platform",
      "Analytics Platform software",
      "Analytics Platform system",
      "analytics solution",
      "analytics service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a analytics platform platform",
      "Create a analytics platform app",
      "I need a analytics platform management system",
      "Build a analytics platform solution",
      "Create a analytics platform booking system"
  ],
};
