/**
 * Diamond Dealer App Type Definition
 *
 * Complete definition for diamond dealer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIAMOND_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'diamond-dealer',
  name: 'Diamond Dealer',
  category: 'services',
  description: 'Diamond Dealer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "diamond dealer",
      "diamond",
      "dealer",
      "diamond software",
      "diamond app",
      "diamond platform",
      "diamond system",
      "diamond management",
      "services diamond"
  ],

  synonyms: [
      "Diamond Dealer platform",
      "Diamond Dealer software",
      "Diamond Dealer system",
      "diamond solution",
      "diamond service"
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
      "Build a diamond dealer platform",
      "Create a diamond dealer app",
      "I need a diamond dealer management system",
      "Build a diamond dealer solution",
      "Create a diamond dealer booking system"
  ],
};
