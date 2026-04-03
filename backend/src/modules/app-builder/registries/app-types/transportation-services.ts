/**
 * Transportation Services App Type Definition
 *
 * Complete definition for transportation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSPORTATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'transportation-services',
  name: 'Transportation Services',
  category: 'transportation',
  description: 'Transportation Services platform with comprehensive management features',
  icon: 'bus',

  keywords: [
      "transportation services",
      "transportation",
      "services",
      "transportation software",
      "transportation app",
      "transportation platform",
      "transportation system",
      "transportation management",
      "transportation transportation"
  ],

  synonyms: [
      "Transportation Services platform",
      "Transportation Services software",
      "Transportation Services system",
      "transportation solution",
      "transportation service"
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
      "reservations",
      "fleet-tracking",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "route-optimization",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'transportation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a transportation services platform",
      "Create a transportation services app",
      "I need a transportation services management system",
      "Build a transportation services solution",
      "Create a transportation services booking system"
  ],
};
