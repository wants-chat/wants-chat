/**
 * Crane Rental App Type Definition
 *
 * Complete definition for crane rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRANE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'crane-rental',
  name: 'Crane Rental',
  category: 'rental',
  description: 'Crane Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "crane rental",
      "crane",
      "rental",
      "crane software",
      "crane app",
      "crane platform",
      "crane system",
      "crane management",
      "rental crane"
  ],

  synonyms: [
      "Crane Rental platform",
      "Crane Rental software",
      "Crane Rental system",
      "crane solution",
      "crane service"
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
      "Build a crane rental platform",
      "Create a crane rental app",
      "I need a crane rental management system",
      "Build a crane rental solution",
      "Create a crane rental booking system"
  ],
};
