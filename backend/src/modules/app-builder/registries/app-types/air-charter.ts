/**
 * Air Charter App Type Definition
 *
 * Complete definition for air charter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'air-charter',
  name: 'Air Charter',
  category: 'services',
  description: 'Air Charter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "air charter",
      "air",
      "charter",
      "air software",
      "air app",
      "air platform",
      "air system",
      "air management",
      "services air"
  ],

  synonyms: [
      "Air Charter platform",
      "Air Charter software",
      "Air Charter system",
      "air solution",
      "air service"
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
      "Build a air charter platform",
      "Create a air charter app",
      "I need a air charter management system",
      "Build a air charter solution",
      "Create a air charter booking system"
  ],
};
