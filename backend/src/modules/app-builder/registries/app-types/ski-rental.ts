/**
 * Ski Rental App Type Definition
 *
 * Complete definition for ski rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKI_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'ski-rental',
  name: 'Ski Rental',
  category: 'rental',
  description: 'Ski Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "ski rental",
      "ski",
      "rental",
      "ski software",
      "ski app",
      "ski platform",
      "ski system",
      "ski management",
      "rental ski"
  ],

  synonyms: [
      "Ski Rental platform",
      "Ski Rental software",
      "Ski Rental system",
      "ski solution",
      "ski service"
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a ski rental platform",
      "Create a ski rental app",
      "I need a ski rental management system",
      "Build a ski rental solution",
      "Create a ski rental booking system"
  ],
};
