/**
 * Investment Management App Type Definition
 *
 * Complete definition for investment management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVESTMENT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'investment-management',
  name: 'Investment Management',
  category: 'services',
  description: 'Investment Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "investment management",
      "investment",
      "management",
      "investment software",
      "investment app",
      "investment platform",
      "investment system",
      "services investment"
  ],

  synonyms: [
      "Investment Management platform",
      "Investment Management software",
      "Investment Management system",
      "investment solution",
      "investment service"
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
      "Build a investment management platform",
      "Create a investment management app",
      "I need a investment management management system",
      "Build a investment management solution",
      "Create a investment management booking system"
  ],
};
