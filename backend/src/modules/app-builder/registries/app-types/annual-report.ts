/**
 * Annual Report App Type Definition
 *
 * Complete definition for annual report applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANNUAL_REPORT_APP_TYPE: AppTypeDefinition = {
  id: 'annual-report',
  name: 'Annual Report',
  category: 'services',
  description: 'Annual Report platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "annual report",
      "annual",
      "report",
      "annual software",
      "annual app",
      "annual platform",
      "annual system",
      "annual management",
      "services annual"
  ],

  synonyms: [
      "Annual Report platform",
      "Annual Report software",
      "Annual Report system",
      "annual solution",
      "annual service"
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
      "Build a annual report platform",
      "Create a annual report app",
      "I need a annual report management system",
      "Build a annual report solution",
      "Create a annual report booking system"
  ],
};
