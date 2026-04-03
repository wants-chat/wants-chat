/**
 * Tractor Dealer App Type Definition
 *
 * Complete definition for tractor dealer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRACTOR_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'tractor-dealer',
  name: 'Tractor Dealer',
  category: 'services',
  description: 'Tractor Dealer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tractor dealer",
      "tractor",
      "dealer",
      "tractor software",
      "tractor app",
      "tractor platform",
      "tractor system",
      "tractor management",
      "services tractor"
  ],

  synonyms: [
      "Tractor Dealer platform",
      "Tractor Dealer software",
      "Tractor Dealer system",
      "tractor solution",
      "tractor service"
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
      "Build a tractor dealer platform",
      "Create a tractor dealer app",
      "I need a tractor dealer management system",
      "Build a tractor dealer solution",
      "Create a tractor dealer booking system"
  ],
};
