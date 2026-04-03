/**
 * Workers Compensation App Type Definition
 *
 * Complete definition for workers compensation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKERS_COMPENSATION_APP_TYPE: AppTypeDefinition = {
  id: 'workers-compensation',
  name: 'Workers Compensation',
  category: 'services',
  description: 'Workers Compensation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "workers compensation",
      "workers",
      "compensation",
      "workers software",
      "workers app",
      "workers platform",
      "workers system",
      "workers management",
      "services workers"
  ],

  synonyms: [
      "Workers Compensation platform",
      "Workers Compensation software",
      "Workers Compensation system",
      "workers solution",
      "workers service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a workers compensation platform",
      "Create a workers compensation app",
      "I need a workers compensation management system",
      "Build a workers compensation solution",
      "Create a workers compensation booking system"
  ],
};
