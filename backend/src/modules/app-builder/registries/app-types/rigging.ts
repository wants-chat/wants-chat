/**
 * Rigging App Type Definition
 *
 * Complete definition for rigging applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIGGING_APP_TYPE: AppTypeDefinition = {
  id: 'rigging',
  name: 'Rigging',
  category: 'services',
  description: 'Rigging platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rigging",
      "rigging software",
      "rigging app",
      "rigging platform",
      "rigging system",
      "rigging management",
      "services rigging"
  ],

  synonyms: [
      "Rigging platform",
      "Rigging software",
      "Rigging system",
      "rigging solution",
      "rigging service"
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
      "Build a rigging platform",
      "Create a rigging app",
      "I need a rigging management system",
      "Build a rigging solution",
      "Create a rigging booking system"
  ],
};
