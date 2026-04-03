/**
 * Styling Services App Type Definition
 *
 * Complete definition for styling services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STYLING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'styling-services',
  name: 'Styling Services',
  category: 'services',
  description: 'Styling Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "styling services",
      "styling",
      "services",
      "styling software",
      "styling app",
      "styling platform",
      "styling system",
      "styling management",
      "services styling"
  ],

  synonyms: [
      "Styling Services platform",
      "Styling Services software",
      "Styling Services system",
      "styling solution",
      "styling service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a styling services platform",
      "Create a styling services app",
      "I need a styling services management system",
      "Build a styling services solution",
      "Create a styling services booking system"
  ],
};
