/**
 * Bitcoin Atm App Type Definition
 *
 * Complete definition for bitcoin atm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BITCOIN_ATM_APP_TYPE: AppTypeDefinition = {
  id: 'bitcoin-atm',
  name: 'Bitcoin Atm',
  category: 'services',
  description: 'Bitcoin Atm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "bitcoin atm",
      "bitcoin",
      "atm",
      "bitcoin software",
      "bitcoin app",
      "bitcoin platform",
      "bitcoin system",
      "bitcoin management",
      "services bitcoin"
  ],

  synonyms: [
      "Bitcoin Atm platform",
      "Bitcoin Atm software",
      "Bitcoin Atm system",
      "bitcoin solution",
      "bitcoin service"
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
      "Build a bitcoin atm platform",
      "Create a bitcoin atm app",
      "I need a bitcoin atm management system",
      "Build a bitcoin atm solution",
      "Create a bitcoin atm booking system"
  ],
};
