/**
 * Party Favors App Type Definition
 *
 * Complete definition for party favors applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_FAVORS_APP_TYPE: AppTypeDefinition = {
  id: 'party-favors',
  name: 'Party Favors',
  category: 'entertainment',
  description: 'Party Favors platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "party favors",
      "party",
      "favors",
      "party software",
      "party app",
      "party platform",
      "party system",
      "party management",
      "entertainment party"
  ],

  synonyms: [
      "Party Favors platform",
      "Party Favors software",
      "Party Favors system",
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
      "ticket-sales",
      "venue-booking",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "reviews",
      "gallery",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
      "Build a party favors platform",
      "Create a party favors app",
      "I need a party favors management system",
      "Build a party favors solution",
      "Create a party favors booking system"
  ],
};
