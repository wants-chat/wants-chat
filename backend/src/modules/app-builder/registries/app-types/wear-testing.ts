/**
 * Wear Testing App Type Definition
 *
 * Complete definition for wear testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEAR_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'wear-testing',
  name: 'Wear Testing',
  category: 'services',
  description: 'Wear Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wear testing",
      "wear",
      "testing",
      "wear software",
      "wear app",
      "wear platform",
      "wear system",
      "wear management",
      "services wear"
  ],

  synonyms: [
      "Wear Testing platform",
      "Wear Testing software",
      "Wear Testing system",
      "wear solution",
      "wear service"
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
      "Build a wear testing platform",
      "Create a wear testing app",
      "I need a wear testing management system",
      "Build a wear testing solution",
      "Create a wear testing booking system"
  ],
};
