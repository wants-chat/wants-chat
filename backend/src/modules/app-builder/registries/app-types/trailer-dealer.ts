/**
 * Trailer Dealer App Type Definition
 *
 * Complete definition for trailer dealer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAILER_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'trailer-dealer',
  name: 'Trailer Dealer',
  category: 'services',
  description: 'Trailer Dealer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trailer dealer",
      "trailer",
      "dealer",
      "trailer software",
      "trailer app",
      "trailer platform",
      "trailer system",
      "trailer management",
      "services trailer"
  ],

  synonyms: [
      "Trailer Dealer platform",
      "Trailer Dealer software",
      "Trailer Dealer system",
      "trailer solution",
      "trailer service"
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
      "Build a trailer dealer platform",
      "Create a trailer dealer app",
      "I need a trailer dealer management system",
      "Build a trailer dealer solution",
      "Create a trailer dealer booking system"
  ],
};
