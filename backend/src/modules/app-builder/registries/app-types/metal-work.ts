/**
 * Metal Work App Type Definition
 *
 * Complete definition for metal work applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const METAL_WORK_APP_TYPE: AppTypeDefinition = {
  id: 'metal-work',
  name: 'Metal Work',
  category: 'services',
  description: 'Metal Work platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "metal work",
      "metal",
      "work",
      "metal software",
      "metal app",
      "metal platform",
      "metal system",
      "metal management",
      "services metal"
  ],

  synonyms: [
      "Metal Work platform",
      "Metal Work software",
      "Metal Work system",
      "metal solution",
      "metal service"
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
      "Build a metal work platform",
      "Create a metal work app",
      "I need a metal work management system",
      "Build a metal work solution",
      "Create a metal work booking system"
  ],
};
