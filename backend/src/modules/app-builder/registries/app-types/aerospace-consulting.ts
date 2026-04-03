/**
 * Aerospace Consulting App Type Definition
 *
 * Complete definition for aerospace consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AEROSPACE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'aerospace-consulting',
  name: 'Aerospace Consulting',
  category: 'wellness',
  description: 'Aerospace Consulting platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "aerospace consulting",
      "aerospace",
      "consulting",
      "aerospace software",
      "aerospace app",
      "aerospace platform",
      "aerospace system",
      "aerospace management",
      "wellness aerospace"
  ],

  synonyms: [
      "Aerospace Consulting platform",
      "Aerospace Consulting software",
      "Aerospace Consulting system",
      "aerospace solution",
      "aerospace service"
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
      "Build a aerospace consulting platform",
      "Create a aerospace consulting app",
      "I need a aerospace consulting management system",
      "Build a aerospace consulting solution",
      "Create a aerospace consulting booking system"
  ],
};
