/**
 * Reflexology App Type Definition
 *
 * Complete definition for reflexology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REFLEXOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'reflexology',
  name: 'Reflexology',
  category: 'services',
  description: 'Reflexology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "reflexology",
      "reflexology software",
      "reflexology app",
      "reflexology platform",
      "reflexology system",
      "reflexology management",
      "services reflexology"
  ],

  synonyms: [
      "Reflexology platform",
      "Reflexology software",
      "Reflexology system",
      "reflexology solution",
      "reflexology service"
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
      "Build a reflexology platform",
      "Create a reflexology app",
      "I need a reflexology management system",
      "Build a reflexology solution",
      "Create a reflexology booking system"
  ],
};
