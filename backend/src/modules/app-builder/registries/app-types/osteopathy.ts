/**
 * Osteopathy App Type Definition
 *
 * Complete definition for osteopathy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OSTEOPATHY_APP_TYPE: AppTypeDefinition = {
  id: 'osteopathy',
  name: 'Osteopathy',
  category: 'services',
  description: 'Osteopathy platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "osteopathy",
      "osteopathy software",
      "osteopathy app",
      "osteopathy platform",
      "osteopathy system",
      "osteopathy management",
      "services osteopathy"
  ],

  synonyms: [
      "Osteopathy platform",
      "Osteopathy software",
      "Osteopathy system",
      "osteopathy solution",
      "osteopathy service"
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
      "Build a osteopathy platform",
      "Create a osteopathy app",
      "I need a osteopathy management system",
      "Build a osteopathy solution",
      "Create a osteopathy booking system"
  ],
};
