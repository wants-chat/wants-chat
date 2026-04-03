/**
 * Staffing Services App Type Definition
 *
 * Complete definition for staffing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAFFING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'staffing-services',
  name: 'Staffing Services',
  category: 'services',
  description: 'Staffing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "staffing services",
      "staffing",
      "services",
      "staffing software",
      "staffing app",
      "staffing platform",
      "staffing system",
      "staffing management",
      "services staffing"
  ],

  synonyms: [
      "Staffing Services platform",
      "Staffing Services software",
      "Staffing Services system",
      "staffing solution",
      "staffing service"
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
      "Build a staffing services platform",
      "Create a staffing services app",
      "I need a staffing services management system",
      "Build a staffing services solution",
      "Create a staffing services booking system"
  ],
};
