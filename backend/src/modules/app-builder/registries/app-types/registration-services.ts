/**
 * Registration Services App Type Definition
 *
 * Complete definition for registration services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REGISTRATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'registration-services',
  name: 'Registration Services',
  category: 'services',
  description: 'Registration Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "registration services",
      "registration",
      "services",
      "registration software",
      "registration app",
      "registration platform",
      "registration system",
      "registration management",
      "services registration"
  ],

  synonyms: [
      "Registration Services platform",
      "Registration Services software",
      "Registration Services system",
      "registration solution",
      "registration service"
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
      "Build a registration services platform",
      "Create a registration services app",
      "I need a registration services management system",
      "Build a registration services solution",
      "Create a registration services booking system"
  ],
};
