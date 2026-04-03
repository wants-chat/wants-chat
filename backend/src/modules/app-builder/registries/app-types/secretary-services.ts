/**
 * Secretary Services App Type Definition
 *
 * Complete definition for secretary services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECRETARY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'secretary-services',
  name: 'Secretary Services',
  category: 'services',
  description: 'Secretary Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "secretary services",
      "secretary",
      "services",
      "secretary software",
      "secretary app",
      "secretary platform",
      "secretary system",
      "secretary management",
      "services secretary"
  ],

  synonyms: [
      "Secretary Services platform",
      "Secretary Services software",
      "Secretary Services system",
      "secretary solution",
      "secretary service"
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
      "Build a secretary services platform",
      "Create a secretary services app",
      "I need a secretary services management system",
      "Build a secretary services solution",
      "Create a secretary services booking system"
  ],
};
