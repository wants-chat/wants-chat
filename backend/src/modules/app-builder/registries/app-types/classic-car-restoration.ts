/**
 * Classic Car Restoration App Type Definition
 *
 * Complete definition for classic car restoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLASSIC_CAR_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'classic-car-restoration',
  name: 'Classic Car Restoration',
  category: 'automotive',
  description: 'Classic Car Restoration platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "classic car restoration",
      "classic",
      "car",
      "restoration",
      "classic software",
      "classic app",
      "classic platform",
      "classic system",
      "classic management",
      "automotive classic"
  ],

  synonyms: [
      "Classic Car Restoration platform",
      "Classic Car Restoration software",
      "Classic Car Restoration system",
      "classic solution",
      "classic service"
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
      "Build a classic car restoration platform",
      "Create a classic car restoration app",
      "I need a classic car restoration management system",
      "Build a classic car restoration solution",
      "Create a classic car restoration booking system"
  ],
};
