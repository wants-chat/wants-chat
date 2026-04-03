/**
 * Pole Dancing App Type Definition
 *
 * Complete definition for pole dancing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POLE_DANCING_APP_TYPE: AppTypeDefinition = {
  id: 'pole-dancing',
  name: 'Pole Dancing',
  category: 'services',
  description: 'Pole Dancing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pole dancing",
      "pole",
      "dancing",
      "pole software",
      "pole app",
      "pole platform",
      "pole system",
      "pole management",
      "services pole"
  ],

  synonyms: [
      "Pole Dancing platform",
      "Pole Dancing software",
      "Pole Dancing system",
      "pole solution",
      "pole service"
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
      "Build a pole dancing platform",
      "Create a pole dancing app",
      "I need a pole dancing management system",
      "Build a pole dancing solution",
      "Create a pole dancing booking system"
  ],
};
