/**
 * Van Rental App Type Definition
 *
 * Complete definition for van rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VAN_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'van-rental',
  name: 'Van Rental',
  category: 'rental',
  description: 'Van Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "van rental",
      "van",
      "rental",
      "van software",
      "van app",
      "van platform",
      "van system",
      "van management",
      "rental van"
  ],

  synonyms: [
      "Van Rental platform",
      "Van Rental software",
      "Van Rental system",
      "van solution",
      "van service"
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
      "Build a van rental platform",
      "Create a van rental app",
      "I need a van rental management system",
      "Build a van rental solution",
      "Create a van rental booking system"
  ],
};
