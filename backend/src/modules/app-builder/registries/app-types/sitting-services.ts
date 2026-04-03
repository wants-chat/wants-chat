/**
 * Sitting Services App Type Definition
 *
 * Complete definition for sitting services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SITTING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'sitting-services',
  name: 'Sitting Services',
  category: 'services',
  description: 'Sitting Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "sitting services",
      "sitting",
      "services",
      "sitting software",
      "sitting app",
      "sitting platform",
      "sitting system",
      "sitting management",
      "services sitting"
  ],

  synonyms: [
      "Sitting Services platform",
      "Sitting Services software",
      "Sitting Services system",
      "sitting solution",
      "sitting service"
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
      "Build a sitting services platform",
      "Create a sitting services app",
      "I need a sitting services management system",
      "Build a sitting services solution",
      "Create a sitting services booking system"
  ],
};
