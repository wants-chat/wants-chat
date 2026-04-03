/**
 * Television Production App Type Definition
 *
 * Complete definition for television production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELEVISION_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'television-production',
  name: 'Television Production',
  category: 'services',
  description: 'Television Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "television production",
      "television",
      "production",
      "television software",
      "television app",
      "television platform",
      "television system",
      "television management",
      "services television"
  ],

  synonyms: [
      "Television Production platform",
      "Television Production software",
      "Television Production system",
      "television solution",
      "television service"
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
      "Build a television production platform",
      "Create a television production app",
      "I need a television production management system",
      "Build a television production solution",
      "Create a television production booking system"
  ],
};
