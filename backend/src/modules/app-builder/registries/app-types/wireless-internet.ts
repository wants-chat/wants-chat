/**
 * Wireless Internet App Type Definition
 *
 * Complete definition for wireless internet applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIRELESS_INTERNET_APP_TYPE: AppTypeDefinition = {
  id: 'wireless-internet',
  name: 'Wireless Internet',
  category: 'services',
  description: 'Wireless Internet platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wireless internet",
      "wireless",
      "internet",
      "wireless software",
      "wireless app",
      "wireless platform",
      "wireless system",
      "wireless management",
      "services wireless"
  ],

  synonyms: [
      "Wireless Internet platform",
      "Wireless Internet software",
      "Wireless Internet system",
      "wireless solution",
      "wireless service"
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
      "Build a wireless internet platform",
      "Create a wireless internet app",
      "I need a wireless internet management system",
      "Build a wireless internet solution",
      "Create a wireless internet booking system"
  ],
};
