/**
 * Office Space App Type Definition
 *
 * Complete definition for office space applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_SPACE_APP_TYPE: AppTypeDefinition = {
  id: 'office-space',
  name: 'Office Space',
  category: 'wellness',
  description: 'Office Space platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "office space",
      "office",
      "space",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "wellness office"
  ],

  synonyms: [
      "Office Space platform",
      "Office Space software",
      "Office Space system",
      "office solution",
      "office service"
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
      "pos-system",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "gallery",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a office space platform",
      "Create a office space app",
      "I need a office space management system",
      "Build a office space solution",
      "Create a office space booking system"
  ],
};
