/**
 * Tuition Services App Type Definition
 *
 * Complete definition for tuition services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUITION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'tuition-services',
  name: 'Tuition Services',
  category: 'services',
  description: 'Tuition Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tuition services",
      "tuition",
      "services",
      "tuition software",
      "tuition app",
      "tuition platform",
      "tuition system",
      "tuition management",
      "services tuition"
  ],

  synonyms: [
      "Tuition Services platform",
      "Tuition Services software",
      "Tuition Services system",
      "tuition solution",
      "tuition service"
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
      "Build a tuition services platform",
      "Create a tuition services app",
      "I need a tuition services management system",
      "Build a tuition services solution",
      "Create a tuition services booking system"
  ],
};
