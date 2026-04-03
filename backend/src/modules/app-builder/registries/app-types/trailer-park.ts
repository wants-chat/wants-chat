/**
 * Trailer Park App Type Definition
 *
 * Complete definition for trailer park applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAILER_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'trailer-park',
  name: 'Trailer Park',
  category: 'services',
  description: 'Trailer Park platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trailer park",
      "trailer",
      "park",
      "trailer software",
      "trailer app",
      "trailer platform",
      "trailer system",
      "trailer management",
      "services trailer"
  ],

  synonyms: [
      "Trailer Park platform",
      "Trailer Park software",
      "Trailer Park system",
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
      "Build a trailer park platform",
      "Create a trailer park app",
      "I need a trailer park management system",
      "Build a trailer park solution",
      "Create a trailer park booking system"
  ],
};
