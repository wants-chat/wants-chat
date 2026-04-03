/**
 * Tanning App Type Definition
 *
 * Complete definition for tanning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TANNING_APP_TYPE: AppTypeDefinition = {
  id: 'tanning',
  name: 'Tanning',
  category: 'services',
  description: 'Tanning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tanning",
      "tanning software",
      "tanning app",
      "tanning platform",
      "tanning system",
      "tanning management",
      "services tanning"
  ],

  synonyms: [
      "Tanning platform",
      "Tanning software",
      "Tanning system",
      "tanning solution",
      "tanning service"
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
      "Build a tanning platform",
      "Create a tanning app",
      "I need a tanning management system",
      "Build a tanning solution",
      "Create a tanning booking system"
  ],
};
