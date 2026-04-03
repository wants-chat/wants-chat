/**
 * Automation Services App Type Definition
 *
 * Complete definition for automation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'automation-services',
  name: 'Automation Services',
  category: 'automotive',
  description: 'Automation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "automation services",
      "automation",
      "services",
      "automation software",
      "automation app",
      "automation platform",
      "automation system",
      "automation management",
      "automotive automation"
  ],

  synonyms: [
      "Automation Services platform",
      "Automation Services software",
      "Automation Services system",
      "automation solution",
      "automation service"
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
      "Build a automation services platform",
      "Create a automation services app",
      "I need a automation services management system",
      "Build a automation services solution",
      "Create a automation services booking system"
  ],
};
