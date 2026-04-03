/**
 * Nail Technician App Type Definition
 *
 * Complete definition for nail technician applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NAIL_TECHNICIAN_APP_TYPE: AppTypeDefinition = {
  id: 'nail-technician',
  name: 'Nail Technician',
  category: 'beauty',
  description: 'Nail Technician platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "nail technician",
      "nail",
      "technician",
      "nail software",
      "nail app",
      "nail platform",
      "nail system",
      "nail management",
      "beauty nail"
  ],

  synonyms: [
      "Nail Technician platform",
      "Nail Technician software",
      "Nail Technician system",
      "nail solution",
      "nail service"
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
      "scheduling",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a nail technician platform",
      "Create a nail technician app",
      "I need a nail technician management system",
      "Build a nail technician solution",
      "Create a nail technician booking system"
  ],
};
