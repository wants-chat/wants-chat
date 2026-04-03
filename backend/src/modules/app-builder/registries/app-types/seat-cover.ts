/**
 * Seat Cover App Type Definition
 *
 * Complete definition for seat cover applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEAT_COVER_APP_TYPE: AppTypeDefinition = {
  id: 'seat-cover',
  name: 'Seat Cover',
  category: 'services',
  description: 'Seat Cover platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "seat cover",
      "seat",
      "cover",
      "seat software",
      "seat app",
      "seat platform",
      "seat system",
      "seat management",
      "services seat"
  ],

  synonyms: [
      "Seat Cover platform",
      "Seat Cover software",
      "Seat Cover system",
      "seat solution",
      "seat service"
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
      "Build a seat cover platform",
      "Create a seat cover app",
      "I need a seat cover management system",
      "Build a seat cover solution",
      "Create a seat cover booking system"
  ],
};
