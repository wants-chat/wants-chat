/**
 * Ultrasound App Type Definition
 *
 * Complete definition for ultrasound applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ULTRASOUND_APP_TYPE: AppTypeDefinition = {
  id: 'ultrasound',
  name: 'Ultrasound',
  category: 'services',
  description: 'Ultrasound platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ultrasound",
      "ultrasound software",
      "ultrasound app",
      "ultrasound platform",
      "ultrasound system",
      "ultrasound management",
      "services ultrasound"
  ],

  synonyms: [
      "Ultrasound platform",
      "Ultrasound software",
      "Ultrasound system",
      "ultrasound solution",
      "ultrasound service"
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
      "Build a ultrasound platform",
      "Create a ultrasound app",
      "I need a ultrasound management system",
      "Build a ultrasound solution",
      "Create a ultrasound booking system"
  ],
};
