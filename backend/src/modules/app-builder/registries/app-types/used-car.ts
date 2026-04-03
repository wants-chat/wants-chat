/**
 * Used Car App Type Definition
 *
 * Complete definition for used car applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_CAR_APP_TYPE: AppTypeDefinition = {
  id: 'used-car',
  name: 'Used Car',
  category: 'automotive',
  description: 'Used Car platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "used car",
      "used",
      "car",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "automotive used"
  ],

  synonyms: [
      "Used Car platform",
      "Used Car software",
      "Used Car system",
      "used solution",
      "used service"
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
      "Build a used car platform",
      "Create a used car app",
      "I need a used car management system",
      "Build a used car solution",
      "Create a used car booking system"
  ],
};
