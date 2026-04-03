/**
 * Sub Contracting App Type Definition
 *
 * Complete definition for sub contracting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUB_CONTRACTING_APP_TYPE: AppTypeDefinition = {
  id: 'sub-contracting',
  name: 'Sub Contracting',
  category: 'services',
  description: 'Sub Contracting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sub contracting",
      "sub",
      "contracting",
      "sub software",
      "sub app",
      "sub platform",
      "sub system",
      "sub management",
      "services sub"
  ],

  synonyms: [
      "Sub Contracting platform",
      "Sub Contracting software",
      "Sub Contracting system",
      "sub solution",
      "sub service"
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
      "Build a sub contracting platform",
      "Create a sub contracting app",
      "I need a sub contracting management system",
      "Build a sub contracting solution",
      "Create a sub contracting booking system"
  ],
};
