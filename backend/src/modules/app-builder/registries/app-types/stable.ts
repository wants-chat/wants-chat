/**
 * Stable App Type Definition
 *
 * Complete definition for stable applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STABLE_APP_TYPE: AppTypeDefinition = {
  id: 'stable',
  name: 'Stable',
  category: 'services',
  description: 'Stable platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stable",
      "stable software",
      "stable app",
      "stable platform",
      "stable system",
      "stable management",
      "services stable"
  ],

  synonyms: [
      "Stable platform",
      "Stable software",
      "Stable system",
      "stable solution",
      "stable service"
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
      "Build a stable platform",
      "Create a stable app",
      "I need a stable management system",
      "Build a stable solution",
      "Create a stable booking system"
  ],
};
