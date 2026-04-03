/**
 * Airport Parking App Type Definition
 *
 * Complete definition for airport parking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRPORT_PARKING_APP_TYPE: AppTypeDefinition = {
  id: 'airport-parking',
  name: 'Airport Parking',
  category: 'services',
  description: 'Airport Parking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "airport parking",
      "airport",
      "parking",
      "airport software",
      "airport app",
      "airport platform",
      "airport system",
      "airport management",
      "services airport"
  ],

  synonyms: [
      "Airport Parking platform",
      "Airport Parking software",
      "Airport Parking system",
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
      "Build a airport parking platform",
      "Create a airport parking app",
      "I need a airport parking management system",
      "Build a airport parking solution",
      "Create a airport parking booking system"
  ],
};
