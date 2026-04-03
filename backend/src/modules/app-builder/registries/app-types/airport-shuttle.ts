/**
 * Airport Shuttle App Type Definition
 *
 * Complete definition for airport shuttle applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRPORT_SHUTTLE_APP_TYPE: AppTypeDefinition = {
  id: 'airport-shuttle',
  name: 'Airport Shuttle',
  category: 'services',
  description: 'Airport Shuttle platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "airport shuttle",
      "airport",
      "shuttle",
      "airport software",
      "airport app",
      "airport platform",
      "airport system",
      "airport management",
      "services airport"
  ],

  synonyms: [
      "Airport Shuttle platform",
      "Airport Shuttle software",
      "Airport Shuttle system",
      "airport solution",
      "airport service"
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
      "Build a airport shuttle platform",
      "Create a airport shuttle app",
      "I need a airport shuttle management system",
      "Build a airport shuttle solution",
      "Create a airport shuttle booking system"
  ],
};
