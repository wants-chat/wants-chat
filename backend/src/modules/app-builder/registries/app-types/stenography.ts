/**
 * Stenography App Type Definition
 *
 * Complete definition for stenography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STENOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'stenography',
  name: 'Stenography',
  category: 'services',
  description: 'Stenography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stenography",
      "stenography software",
      "stenography app",
      "stenography platform",
      "stenography system",
      "stenography management",
      "services stenography"
  ],

  synonyms: [
      "Stenography platform",
      "Stenography software",
      "Stenography system",
      "stenography solution",
      "stenography service"
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
      "Build a stenography platform",
      "Create a stenography app",
      "I need a stenography management system",
      "Build a stenography solution",
      "Create a stenography booking system"
  ],
};
