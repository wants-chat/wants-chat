/**
 * Wheelchair Services App Type Definition
 *
 * Complete definition for wheelchair services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHEELCHAIR_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wheelchair-services',
  name: 'Wheelchair Services',
  category: 'beauty',
  description: 'Wheelchair Services platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "wheelchair services",
      "wheelchair",
      "services",
      "wheelchair software",
      "wheelchair app",
      "wheelchair platform",
      "wheelchair system",
      "wheelchair management",
      "beauty wheelchair"
  ],

  synonyms: [
      "Wheelchair Services platform",
      "Wheelchair Services software",
      "Wheelchair Services system",
      "wheelchair solution",
      "wheelchair service"
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
      "Build a wheelchair services platform",
      "Create a wheelchair services app",
      "I need a wheelchair services management system",
      "Build a wheelchair services solution",
      "Create a wheelchair services booking system"
  ],
};
