/**
 * Spanish School App Type Definition
 *
 * Complete definition for spanish school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPANISH_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'spanish-school',
  name: 'Spanish School',
  category: 'wellness',
  description: 'Spanish School platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "spanish school",
      "spanish",
      "school",
      "spanish software",
      "spanish app",
      "spanish platform",
      "spanish system",
      "spanish management",
      "wellness spanish"
  ],

  synonyms: [
      "Spanish School platform",
      "Spanish School software",
      "Spanish School system",
      "spanish solution",
      "spanish service"
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
      "Build a spanish school platform",
      "Create a spanish school app",
      "I need a spanish school management system",
      "Build a spanish school solution",
      "Create a spanish school booking system"
  ],
};
