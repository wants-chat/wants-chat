/**
 * Award Ceremonies App Type Definition
 *
 * Complete definition for award ceremonies applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AWARD_CEREMONIES_APP_TYPE: AppTypeDefinition = {
  id: 'award-ceremonies',
  name: 'Award Ceremonies',
  category: 'services',
  description: 'Award Ceremonies platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "award ceremonies",
      "award",
      "ceremonies",
      "award software",
      "award app",
      "award platform",
      "award system",
      "award management",
      "services award"
  ],

  synonyms: [
      "Award Ceremonies platform",
      "Award Ceremonies software",
      "Award Ceremonies system",
      "award solution",
      "award service"
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
      "Build a award ceremonies platform",
      "Create a award ceremonies app",
      "I need a award ceremonies management system",
      "Build a award ceremonies solution",
      "Create a award ceremonies booking system"
  ],
};
