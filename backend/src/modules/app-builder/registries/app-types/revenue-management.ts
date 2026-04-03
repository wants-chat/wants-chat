/**
 * Revenue Management App Type Definition
 *
 * Complete definition for revenue management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REVENUE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'revenue-management',
  name: 'Revenue Management',
  category: 'entertainment',
  description: 'Revenue Management platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "revenue management",
      "revenue",
      "management",
      "revenue software",
      "revenue app",
      "revenue platform",
      "revenue system",
      "events revenue"
  ],

  synonyms: [
      "Revenue Management platform",
      "Revenue Management software",
      "Revenue Management system",
      "revenue solution",
      "revenue service"
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
      "venue-booking",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "gallery",
      "reviews",
      "contracts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'events',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a revenue management platform",
      "Create a revenue management app",
      "I need a revenue management management system",
      "Build a revenue management solution",
      "Create a revenue management booking system"
  ],
};
