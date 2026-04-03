/**
 * Restoration App Type Definition
 *
 * Complete definition for restoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'restoration',
  name: 'Restoration',
  category: 'services',
  description: 'Restoration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "restoration",
      "restoration software",
      "restoration app",
      "restoration platform",
      "restoration system",
      "restoration management",
      "services restoration"
  ],

  synonyms: [
      "Restoration platform",
      "Restoration software",
      "Restoration system",
      "restoration solution",
      "restoration service"
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
      "Build a restoration platform",
      "Create a restoration app",
      "I need a restoration management system",
      "Build a restoration solution",
      "Create a restoration booking system"
  ],
};
