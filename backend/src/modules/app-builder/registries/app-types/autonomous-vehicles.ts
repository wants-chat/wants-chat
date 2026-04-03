/**
 * Autonomous Vehicles App Type Definition
 *
 * Complete definition for autonomous vehicles applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTONOMOUS_VEHICLES_APP_TYPE: AppTypeDefinition = {
  id: 'autonomous-vehicles',
  name: 'Autonomous Vehicles',
  category: 'automotive',
  description: 'Autonomous Vehicles platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "autonomous vehicles",
      "autonomous",
      "vehicles",
      "autonomous software",
      "autonomous app",
      "autonomous platform",
      "autonomous system",
      "autonomous management",
      "automotive autonomous"
  ],

  synonyms: [
      "Autonomous Vehicles platform",
      "Autonomous Vehicles software",
      "Autonomous Vehicles system",
      "autonomous solution",
      "autonomous service"
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
      "Build a autonomous vehicles platform",
      "Create a autonomous vehicles app",
      "I need a autonomous vehicles management system",
      "Build a autonomous vehicles solution",
      "Create a autonomous vehicles booking system"
  ],
};
