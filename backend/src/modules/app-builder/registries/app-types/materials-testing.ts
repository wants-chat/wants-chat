/**
 * Materials Testing App Type Definition
 *
 * Complete definition for materials testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATERIALS_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'materials-testing',
  name: 'Materials Testing',
  category: 'services',
  description: 'Materials Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "materials testing",
      "materials",
      "testing",
      "materials software",
      "materials app",
      "materials platform",
      "materials system",
      "materials management",
      "services materials"
  ],

  synonyms: [
      "Materials Testing platform",
      "Materials Testing software",
      "Materials Testing system",
      "materials solution",
      "materials service"
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
      "Build a materials testing platform",
      "Create a materials testing app",
      "I need a materials testing management system",
      "Build a materials testing solution",
      "Create a materials testing booking system"
  ],
};
