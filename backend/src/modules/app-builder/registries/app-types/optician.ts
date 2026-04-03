/**
 * Optician App Type Definition
 *
 * Complete definition for optician applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPTICIAN_APP_TYPE: AppTypeDefinition = {
  id: 'optician',
  name: 'Optician',
  category: 'services',
  description: 'Optician platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "optician",
      "optician software",
      "optician app",
      "optician platform",
      "optician system",
      "optician management",
      "services optician"
  ],

  synonyms: [
      "Optician platform",
      "Optician software",
      "Optician system",
      "optician solution",
      "optician service"
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
      "Build a optician platform",
      "Create a optician app",
      "I need a optician management system",
      "Build a optician solution",
      "Create a optician booking system"
  ],
};
