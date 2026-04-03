/**
 * Mobile Car Wash App Type Definition
 *
 * Complete definition for mobile car wash applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_CAR_WASH_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-car-wash',
  name: 'Mobile Car Wash',
  category: 'automotive',
  description: 'Mobile Car Wash platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "mobile car wash",
      "mobile",
      "car",
      "wash",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "automotive mobile"
  ],

  synonyms: [
      "Mobile Car Wash platform",
      "Mobile Car Wash software",
      "Mobile Car Wash system",
      "mobile solution",
      "mobile service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a mobile car wash platform",
      "Create a mobile car wash app",
      "I need a mobile car wash management system",
      "Build a mobile car wash solution",
      "Create a mobile car wash booking system"
  ],
};
