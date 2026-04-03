/**
 * Microblading App Type Definition
 *
 * Complete definition for microblading applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MICROBLADING_APP_TYPE: AppTypeDefinition = {
  id: 'microblading',
  name: 'Microblading',
  category: 'services',
  description: 'Microblading platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "microblading",
      "microblading software",
      "microblading app",
      "microblading platform",
      "microblading system",
      "microblading management",
      "services microblading"
  ],

  synonyms: [
      "Microblading platform",
      "Microblading software",
      "Microblading system",
      "microblading solution",
      "microblading service"
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
      "Build a microblading platform",
      "Create a microblading app",
      "I need a microblading management system",
      "Build a microblading solution",
      "Create a microblading booking system"
  ],
};
