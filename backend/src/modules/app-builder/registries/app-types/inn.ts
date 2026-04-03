/**
 * Inn App Type Definition
 *
 * Complete definition for inn applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INN_APP_TYPE: AppTypeDefinition = {
  id: 'inn',
  name: 'Inn',
  category: 'hospitality',
  description: 'Inn platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "inn",
      "inn software",
      "inn app",
      "inn platform",
      "inn system",
      "inn management",
      "hospitality inn"
  ],

  synonyms: [
      "Inn platform",
      "Inn software",
      "Inn system",
      "inn solution",
      "inn service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "room-booking",
      "housekeeping",
      "guest-services",
      "channel-manager",
      "notifications"
  ],

  optionalFeatures: [
      "rate-management",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a inn platform",
      "Create a inn app",
      "I need a inn management system",
      "Build a inn solution",
      "Create a inn booking system"
  ],
};
