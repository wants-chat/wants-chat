/**
 * Aviation Maintenance App Type Definition
 *
 * Complete definition for aviation maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-maintenance',
  name: 'Aviation Maintenance',
  category: 'services',
  description: 'Aviation Maintenance platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "aviation maintenance",
      "aviation",
      "maintenance",
      "aviation software",
      "aviation app",
      "aviation platform",
      "aviation system",
      "aviation management",
      "services aviation"
  ],

  synonyms: [
      "Aviation Maintenance platform",
      "Aviation Maintenance software",
      "Aviation Maintenance system",
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
      "Build a aviation maintenance platform",
      "Create a aviation maintenance app",
      "I need a aviation maintenance management system",
      "Build a aviation maintenance solution",
      "Create a aviation maintenance booking system"
  ],
};
