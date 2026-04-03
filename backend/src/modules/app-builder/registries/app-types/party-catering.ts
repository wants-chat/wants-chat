/**
 * Party Catering App Type Definition
 *
 * Complete definition for party catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'party-catering',
  name: 'Party Catering',
  category: 'hospitality',
  description: 'Party Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "party catering",
      "party",
      "catering",
      "party software",
      "party app",
      "party platform",
      "party system",
      "party management",
      "food-beverage party"
  ],

  synonyms: [
      "Party Catering platform",
      "Party Catering software",
      "Party Catering system",
      "party solution",
      "party service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "orders",
      "menu-management",
      "calendar",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "contracts",
      "clients",
      "reporting",
      "gallery"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a party catering platform",
      "Create a party catering app",
      "I need a party catering management system",
      "Build a party catering solution",
      "Create a party catering booking system"
  ],
};
