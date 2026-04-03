/**
 * Workshop Space App Type Definition
 *
 * Complete definition for workshop space applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKSHOP_SPACE_APP_TYPE: AppTypeDefinition = {
  id: 'workshop-space',
  name: 'Workshop Space',
  category: 'wellness',
  description: 'Workshop Space platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "workshop space",
      "workshop",
      "space",
      "workshop software",
      "workshop app",
      "workshop platform",
      "workshop system",
      "workshop management",
      "wellness workshop"
  ],

  synonyms: [
      "Workshop Space platform",
      "Workshop Space software",
      "Workshop Space system",
      "workshop solution",
      "workshop service"
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
      "Build a workshop space platform",
      "Create a workshop space app",
      "I need a workshop space management system",
      "Build a workshop space solution",
      "Create a workshop space booking system"
  ],
};
