/**
 * Airbnb Management App Type Definition
 *
 * Complete definition for airbnb management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRBNB_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'airbnb-management',
  name: 'Airbnb Management',
  category: 'hospitality',
  description: 'Airbnb Management platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "airbnb management",
      "airbnb",
      "management",
      "airbnb software",
      "airbnb app",
      "airbnb platform",
      "airbnb system",
      "hospitality airbnb"
  ],

  synonyms: [
      "Airbnb Management platform",
      "Airbnb Management software",
      "Airbnb Management system",
      "airbnb solution",
      "airbnb service"
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
      "Build a airbnb management platform",
      "Create a airbnb management app",
      "I need a airbnb management management system",
      "Build a airbnb management solution",
      "Create a airbnb management booking system"
  ],
};
