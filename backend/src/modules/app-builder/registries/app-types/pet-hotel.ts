/**
 * Pet Hotel App Type Definition
 *
 * Complete definition for pet hotel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_HOTEL_APP_TYPE: AppTypeDefinition = {
  id: 'pet-hotel',
  name: 'Pet Hotel',
  category: 'hospitality',
  description: 'Pet Hotel platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "pet hotel",
      "pet",
      "hotel",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "hospitality pet"
  ],

  synonyms: [
      "Pet Hotel platform",
      "Pet Hotel software",
      "Pet Hotel system",
      "pet solution",
      "pet service"
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
      "Build a pet hotel platform",
      "Create a pet hotel app",
      "I need a pet hotel management system",
      "Build a pet hotel solution",
      "Create a pet hotel booking system"
  ],
};
