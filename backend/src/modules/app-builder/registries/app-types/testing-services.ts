/**
 * Testing Services App Type Definition
 *
 * Complete definition for testing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TESTING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'testing-services',
  name: 'Testing Services',
  category: 'services',
  description: 'Testing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "testing services",
      "testing",
      "services",
      "testing software",
      "testing app",
      "testing platform",
      "testing system",
      "testing management",
      "services testing"
  ],

  synonyms: [
      "Testing Services platform",
      "Testing Services software",
      "Testing Services system",
      "testing solution",
      "testing service"
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
      "Build a testing services platform",
      "Create a testing services app",
      "I need a testing services management system",
      "Build a testing services solution",
      "Create a testing services booking system"
  ],
};
