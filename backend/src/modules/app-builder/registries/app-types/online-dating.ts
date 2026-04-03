/**
 * Online Dating App Type Definition
 *
 * Complete definition for online dating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_DATING_APP_TYPE: AppTypeDefinition = {
  id: 'online-dating',
  name: 'Online Dating',
  category: 'services',
  description: 'Online Dating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "online dating",
      "online",
      "dating",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "services online"
  ],

  synonyms: [
      "Online Dating platform",
      "Online Dating software",
      "Online Dating system",
      "online solution",
      "online service"
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
      "Build a online dating platform",
      "Create a online dating app",
      "I need a online dating management system",
      "Build a online dating solution",
      "Create a online dating booking system"
  ],
};
