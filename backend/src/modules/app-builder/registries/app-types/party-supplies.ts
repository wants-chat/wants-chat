/**
 * Party Supplies App Type Definition
 *
 * Complete definition for party supplies applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_SUPPLIES_APP_TYPE: AppTypeDefinition = {
  id: 'party-supplies',
  name: 'Party Supplies',
  category: 'entertainment',
  description: 'Party Supplies platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "party supplies",
      "party",
      "supplies",
      "party software",
      "party app",
      "party platform",
      "party system",
      "party management",
      "entertainment party"
  ],

  synonyms: [
      "Party Supplies platform",
      "Party Supplies software",
      "Party Supplies system",
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
      "Build a party supplies platform",
      "Create a party supplies app",
      "I need a party supplies management system",
      "Build a party supplies solution",
      "Create a party supplies booking system"
  ],
};
