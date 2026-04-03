/**
 * Suite Hotel App Type Definition
 *
 * Complete definition for suite hotel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUITE_HOTEL_APP_TYPE: AppTypeDefinition = {
  id: 'suite-hotel',
  name: 'Suite Hotel',
  category: 'hospitality',
  description: 'Suite Hotel platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "suite hotel",
      "suite",
      "hotel",
      "suite software",
      "suite app",
      "suite platform",
      "suite system",
      "suite management",
      "hospitality suite"
  ],

  synonyms: [
      "Suite Hotel platform",
      "Suite Hotel software",
      "Suite Hotel system",
      "suite solution",
      "suite service"
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
      "Build a suite hotel platform",
      "Create a suite hotel app",
      "I need a suite hotel management system",
      "Build a suite hotel solution",
      "Create a suite hotel booking system"
  ],
};
