/**
 * Sky Diving App Type Definition
 *
 * Complete definition for sky diving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKY_DIVING_APP_TYPE: AppTypeDefinition = {
  id: 'sky-diving',
  name: 'Sky Diving',
  category: 'services',
  description: 'Sky Diving platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sky diving",
      "sky",
      "diving",
      "sky software",
      "sky app",
      "sky platform",
      "sky system",
      "sky management",
      "services sky"
  ],

  synonyms: [
      "Sky Diving platform",
      "Sky Diving software",
      "Sky Diving system",
      "sky solution",
      "sky service"
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
      "Build a sky diving platform",
      "Create a sky diving app",
      "I need a sky diving management system",
      "Build a sky diving solution",
      "Create a sky diving booking system"
  ],
};
