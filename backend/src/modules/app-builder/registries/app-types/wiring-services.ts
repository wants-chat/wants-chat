/**
 * Wiring Services App Type Definition
 *
 * Complete definition for wiring services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIRING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wiring-services',
  name: 'Wiring Services',
  category: 'services',
  description: 'Wiring Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wiring services",
      "wiring",
      "services",
      "wiring software",
      "wiring app",
      "wiring platform",
      "wiring system",
      "wiring management",
      "services wiring"
  ],

  synonyms: [
      "Wiring Services platform",
      "Wiring Services software",
      "Wiring Services system",
      "wiring solution",
      "wiring service"
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
      "Build a wiring services platform",
      "Create a wiring services app",
      "I need a wiring services management system",
      "Build a wiring services solution",
      "Create a wiring services booking system"
  ],
};
