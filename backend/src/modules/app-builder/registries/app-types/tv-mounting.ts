/**
 * Tv Mounting App Type Definition
 *
 * Complete definition for tv mounting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TV_MOUNTING_APP_TYPE: AppTypeDefinition = {
  id: 'tv-mounting',
  name: 'Tv Mounting',
  category: 'services',
  description: 'Tv Mounting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tv mounting",
      "mounting",
      "tv software",
      "tv app",
      "tv platform",
      "tv system",
      "tv management",
      "services tv"
  ],

  synonyms: [
      "Tv Mounting platform",
      "Tv Mounting software",
      "Tv Mounting system",
      "tv solution",
      "tv service"
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
      "Build a tv mounting platform",
      "Create a tv mounting app",
      "I need a tv mounting management system",
      "Build a tv mounting solution",
      "Create a tv mounting booking system"
  ],
};
