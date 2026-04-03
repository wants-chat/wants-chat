/**
 * Autopsy Services App Type Definition
 *
 * Complete definition for autopsy services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOPSY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'autopsy-services',
  name: 'Autopsy Services',
  category: 'automotive',
  description: 'Autopsy Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "autopsy services",
      "autopsy",
      "services",
      "autopsy software",
      "autopsy app",
      "autopsy platform",
      "autopsy system",
      "autopsy management",
      "automotive autopsy"
  ],

  synonyms: [
      "Autopsy Services platform",
      "Autopsy Services software",
      "Autopsy Services system",
      "autopsy solution",
      "autopsy service"
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
      "service-scheduling",
      "appointments",
      "parts-catalog",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "vehicle-history",
      "payments",
      "reviews",
      "inventory",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a autopsy services platform",
      "Create a autopsy services app",
      "I need a autopsy services management system",
      "Build a autopsy services solution",
      "Create a autopsy services booking system"
  ],
};
