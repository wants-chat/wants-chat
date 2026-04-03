/**
 * Beverage Distributor App Type Definition
 *
 * Complete definition for beverage distributor applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BEVERAGE_DISTRIBUTOR_APP_TYPE: AppTypeDefinition = {
  id: 'beverage-distributor',
  name: 'Beverage Distributor',
  category: 'services',
  description: 'Beverage Distributor platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "beverage distributor",
      "beverage",
      "distributor",
      "beverage software",
      "beverage app",
      "beverage platform",
      "beverage system",
      "beverage management",
      "services beverage"
  ],

  synonyms: [
      "Beverage Distributor platform",
      "Beverage Distributor software",
      "Beverage Distributor system",
      "beverage solution",
      "beverage service"
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
      "Build a beverage distributor platform",
      "Create a beverage distributor app",
      "I need a beverage distributor management system",
      "Build a beverage distributor solution",
      "Create a beverage distributor booking system"
  ],
};
