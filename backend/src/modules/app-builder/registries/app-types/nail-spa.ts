/**
 * Nail Spa App Type Definition
 *
 * Complete definition for nail spa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NAIL_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'nail-spa',
  name: 'Nail Spa',
  category: 'wellness',
  description: 'Nail Spa platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "nail spa",
      "nail",
      "spa",
      "nail software",
      "nail app",
      "nail platform",
      "nail system",
      "nail management",
      "wellness nail"
  ],

  synonyms: [
      "Nail Spa platform",
      "Nail Spa software",
      "Nail Spa system",
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
      "Build a nail spa platform",
      "Create a nail spa app",
      "I need a nail spa management system",
      "Build a nail spa solution",
      "Create a nail spa booking system"
  ],
};
