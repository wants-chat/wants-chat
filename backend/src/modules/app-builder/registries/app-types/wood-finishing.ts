/**
 * Wood Finishing App Type Definition
 *
 * Complete definition for wood finishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOOD_FINISHING_APP_TYPE: AppTypeDefinition = {
  id: 'wood-finishing',
  name: 'Wood Finishing',
  category: 'services',
  description: 'Wood Finishing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wood finishing",
      "wood",
      "finishing",
      "wood software",
      "wood app",
      "wood platform",
      "wood system",
      "wood management",
      "services wood"
  ],

  synonyms: [
      "Wood Finishing platform",
      "Wood Finishing software",
      "Wood Finishing system",
      "wood solution",
      "wood service"
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
      "Build a wood finishing platform",
      "Create a wood finishing app",
      "I need a wood finishing management system",
      "Build a wood finishing solution",
      "Create a wood finishing booking system"
  ],
};
