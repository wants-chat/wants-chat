/**
 * Auditing Services App Type Definition
 *
 * Complete definition for auditing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDITING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'auditing-services',
  name: 'Auditing Services',
  category: 'services',
  description: 'Auditing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "auditing services",
      "auditing",
      "services",
      "auditing software",
      "auditing app",
      "auditing platform",
      "auditing system",
      "auditing management",
      "services auditing"
  ],

  synonyms: [
      "Auditing Services platform",
      "Auditing Services software",
      "Auditing Services system",
      "auditing solution",
      "auditing service"
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
      "Build a auditing services platform",
      "Create a auditing services app",
      "I need a auditing services management system",
      "Build a auditing services solution",
      "Create a auditing services booking system"
  ],
};
