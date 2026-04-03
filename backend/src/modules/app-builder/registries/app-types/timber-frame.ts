/**
 * Timber Frame App Type Definition
 *
 * Complete definition for timber frame applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIMBER_FRAME_APP_TYPE: AppTypeDefinition = {
  id: 'timber-frame',
  name: 'Timber Frame',
  category: 'services',
  description: 'Timber Frame platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "timber frame",
      "timber",
      "frame",
      "timber software",
      "timber app",
      "timber platform",
      "timber system",
      "timber management",
      "services timber"
  ],

  synonyms: [
      "Timber Frame platform",
      "Timber Frame software",
      "Timber Frame system",
      "timber solution",
      "timber service"
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
      "Build a timber frame platform",
      "Create a timber frame app",
      "I need a timber frame management system",
      "Build a timber frame solution",
      "Create a timber frame booking system"
  ],
};
