/**
 * Aviation Services App Type Definition
 *
 * Complete definition for aviation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-services',
  name: 'Aviation Services',
  category: 'services',
  description: 'Aviation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "aviation services",
      "aviation",
      "services",
      "aviation software",
      "aviation app",
      "aviation platform",
      "aviation system",
      "aviation management",
      "services aviation"
  ],

  synonyms: [
      "Aviation Services platform",
      "Aviation Services software",
      "Aviation Services system",
      "aviation solution",
      "aviation service"
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
      "Build a aviation services platform",
      "Create a aviation services app",
      "I need a aviation services management system",
      "Build a aviation services solution",
      "Create a aviation services booking system"
  ],
};
