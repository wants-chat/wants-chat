/**
 * Wealth Management App Type Definition
 *
 * Complete definition for wealth management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEALTH_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'wealth-management',
  name: 'Wealth Management',
  category: 'services',
  description: 'Wealth Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wealth management",
      "wealth",
      "management",
      "wealth software",
      "wealth app",
      "wealth platform",
      "wealth system",
      "services wealth"
  ],

  synonyms: [
      "Wealth Management platform",
      "Wealth Management software",
      "Wealth Management system",
      "wealth solution",
      "wealth service"
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
      "Build a wealth management platform",
      "Create a wealth management app",
      "I need a wealth management management system",
      "Build a wealth management solution",
      "Create a wealth management booking system"
  ],
};
