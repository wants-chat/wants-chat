/**
 * Airport Lounge App Type Definition
 *
 * Complete definition for airport lounge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRPORT_LOUNGE_APP_TYPE: AppTypeDefinition = {
  id: 'airport-lounge',
  name: 'Airport Lounge',
  category: 'services',
  description: 'Airport Lounge platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "airport lounge",
      "airport",
      "lounge",
      "airport software",
      "airport app",
      "airport platform",
      "airport system",
      "airport management",
      "services airport"
  ],

  synonyms: [
      "Airport Lounge platform",
      "Airport Lounge software",
      "Airport Lounge system",
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
      "Build a airport lounge platform",
      "Create a airport lounge app",
      "I need a airport lounge management system",
      "Build a airport lounge solution",
      "Create a airport lounge booking system"
  ],
};
