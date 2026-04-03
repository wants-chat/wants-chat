/**
 * Shade Structure App Type Definition
 *
 * Complete definition for shade structure applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHADE_STRUCTURE_APP_TYPE: AppTypeDefinition = {
  id: 'shade-structure',
  name: 'Shade Structure',
  category: 'services',
  description: 'Shade Structure platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "shade structure",
      "shade",
      "structure",
      "shade software",
      "shade app",
      "shade platform",
      "shade system",
      "shade management",
      "services shade"
  ],

  synonyms: [
      "Shade Structure platform",
      "Shade Structure software",
      "Shade Structure system",
      "shade solution",
      "shade service"
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
      "Build a shade structure platform",
      "Create a shade structure app",
      "I need a shade structure management system",
      "Build a shade structure solution",
      "Create a shade structure booking system"
  ],
};
