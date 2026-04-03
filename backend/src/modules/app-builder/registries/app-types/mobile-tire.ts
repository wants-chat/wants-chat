/**
 * Mobile Tire App Type Definition
 *
 * Complete definition for mobile tire applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_TIRE_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-tire',
  name: 'Mobile Tire',
  category: 'automotive',
  description: 'Mobile Tire platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "mobile tire",
      "mobile",
      "tire",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "automotive mobile"
  ],

  synonyms: [
      "Mobile Tire platform",
      "Mobile Tire software",
      "Mobile Tire system",
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
      "Build a mobile tire platform",
      "Create a mobile tire app",
      "I need a mobile tire management system",
      "Build a mobile tire solution",
      "Create a mobile tire booking system"
  ],
};
