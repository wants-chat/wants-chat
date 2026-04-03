/**
 * Tour Services App Type Definition
 *
 * Complete definition for tour services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUR_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'tour-services',
  name: 'Tour Services',
  category: 'services',
  description: 'Tour Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tour services",
      "tour",
      "services",
      "tour software",
      "tour app",
      "tour platform",
      "tour system",
      "tour management",
      "services tour"
  ],

  synonyms: [
      "Tour Services platform",
      "Tour Services software",
      "Tour Services system",
      "tour solution",
      "tour service"
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
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a tour services platform",
      "Create a tour services app",
      "I need a tour services management system",
      "Build a tour services solution",
      "Create a tour services booking system"
  ],
};
