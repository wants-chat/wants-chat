/**
 * Memorial Services App Type Definition
 *
 * Complete definition for memorial services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEMORIAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'memorial-services',
  name: 'Memorial Services',
  category: 'services',
  description: 'Memorial Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "memorial services",
      "memorial",
      "services",
      "memorial software",
      "memorial app",
      "memorial platform",
      "memorial system",
      "memorial management",
      "services memorial"
  ],

  synonyms: [
      "Memorial Services platform",
      "Memorial Services software",
      "Memorial Services system",
      "memorial solution",
      "memorial service"
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
      "Build a memorial services platform",
      "Create a memorial services app",
      "I need a memorial services management system",
      "Build a memorial services solution",
      "Create a memorial services booking system"
  ],
};
