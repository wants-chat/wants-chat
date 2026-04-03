/**
 * Office Management App Type Definition
 *
 * Complete definition for office management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'office-management',
  name: 'Office Management',
  category: 'services',
  description: 'Office Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "office management",
      "office",
      "management",
      "office software",
      "office app",
      "office platform",
      "office system",
      "services office"
  ],

  synonyms: [
      "Office Management platform",
      "Office Management software",
      "Office Management system",
      "office solution",
      "office service"
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
      "Build a office management platform",
      "Create a office management app",
      "I need a office management management system",
      "Build a office management solution",
      "Create a office management booking system"
  ],
};
