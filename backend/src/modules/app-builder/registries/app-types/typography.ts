/**
 * Typography App Type Definition
 *
 * Complete definition for typography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TYPOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'typography',
  name: 'Typography',
  category: 'services',
  description: 'Typography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "typography",
      "typography software",
      "typography app",
      "typography platform",
      "typography system",
      "typography management",
      "services typography"
  ],

  synonyms: [
      "Typography platform",
      "Typography software",
      "Typography system",
      "typography solution",
      "typography service"
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
      "Build a typography platform",
      "Create a typography app",
      "I need a typography management system",
      "Build a typography solution",
      "Create a typography booking system"
  ],
};
