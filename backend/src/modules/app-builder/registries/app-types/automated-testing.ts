/**
 * Automated Testing App Type Definition
 *
 * Complete definition for automated testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMATED_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'automated-testing',
  name: 'Automated Testing',
  category: 'automotive',
  description: 'Automated Testing platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "automated testing",
      "automated",
      "testing",
      "automated software",
      "automated app",
      "automated platform",
      "automated system",
      "automated management",
      "automotive automated"
  ],

  synonyms: [
      "Automated Testing platform",
      "Automated Testing software",
      "Automated Testing system",
      "automated solution",
      "automated service"
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
      "Build a automated testing platform",
      "Create a automated testing app",
      "I need a automated testing management system",
      "Build a automated testing solution",
      "Create a automated testing booking system"
  ],
};
