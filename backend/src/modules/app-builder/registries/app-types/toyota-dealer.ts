/**
 * Toyota Dealer App Type Definition
 *
 * Complete definition for toyota dealer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOYOTA_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'toyota-dealer',
  name: 'Toyota Dealer',
  category: 'services',
  description: 'Toyota Dealer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "toyota dealer",
      "toyota",
      "dealer",
      "toyota software",
      "toyota app",
      "toyota platform",
      "toyota system",
      "toyota management",
      "services toyota"
  ],

  synonyms: [
      "Toyota Dealer platform",
      "Toyota Dealer software",
      "Toyota Dealer system",
      "toyota solution",
      "toyota service"
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
      "Build a toyota dealer platform",
      "Create a toyota dealer app",
      "I need a toyota dealer management system",
      "Build a toyota dealer solution",
      "Create a toyota dealer booking system"
  ],
};
