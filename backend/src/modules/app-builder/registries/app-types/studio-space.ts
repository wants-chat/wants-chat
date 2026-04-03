/**
 * Studio Space App Type Definition
 *
 * Complete definition for studio space applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDIO_SPACE_APP_TYPE: AppTypeDefinition = {
  id: 'studio-space',
  name: 'Studio Space',
  category: 'wellness',
  description: 'Studio Space platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "studio space",
      "studio",
      "space",
      "studio software",
      "studio app",
      "studio platform",
      "studio system",
      "studio management",
      "wellness studio"
  ],

  synonyms: [
      "Studio Space platform",
      "Studio Space software",
      "Studio Space system",
      "studio solution",
      "studio service"
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
      "Build a studio space platform",
      "Create a studio space app",
      "I need a studio space management system",
      "Build a studio space solution",
      "Create a studio space booking system"
  ],
};
