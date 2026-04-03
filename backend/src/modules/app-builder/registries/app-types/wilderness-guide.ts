/**
 * Wilderness Guide App Type Definition
 *
 * Complete definition for wilderness guide applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDERNESS_GUIDE_APP_TYPE: AppTypeDefinition = {
  id: 'wilderness-guide',
  name: 'Wilderness Guide',
  category: 'services',
  description: 'Wilderness Guide platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wilderness guide",
      "wilderness",
      "guide",
      "wilderness software",
      "wilderness app",
      "wilderness platform",
      "wilderness system",
      "wilderness management",
      "services wilderness"
  ],

  synonyms: [
      "Wilderness Guide platform",
      "Wilderness Guide software",
      "Wilderness Guide system",
      "wilderness solution",
      "wilderness service"
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
      "Build a wilderness guide platform",
      "Create a wilderness guide app",
      "I need a wilderness guide management system",
      "Build a wilderness guide solution",
      "Create a wilderness guide booking system"
  ],
};
