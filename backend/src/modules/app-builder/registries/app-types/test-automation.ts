/**
 * Test Automation App Type Definition
 *
 * Complete definition for test automation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEST_AUTOMATION_APP_TYPE: AppTypeDefinition = {
  id: 'test-automation',
  name: 'Test Automation',
  category: 'automotive',
  description: 'Test Automation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "test automation",
      "test",
      "automation",
      "test software",
      "test app",
      "test platform",
      "test system",
      "test management",
      "automotive test"
  ],

  synonyms: [
      "Test Automation platform",
      "Test Automation software",
      "Test Automation system",
      "test solution",
      "test service"
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
      "service-scheduling",
      "appointments",
      "parts-catalog",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "vehicle-history",
      "payments",
      "reviews",
      "inventory",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a test automation platform",
      "Create a test automation app",
      "I need a test automation management system",
      "Build a test automation solution",
      "Create a test automation booking system"
  ],
};
