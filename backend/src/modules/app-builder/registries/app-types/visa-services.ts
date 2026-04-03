/**
 * Visa Services App Type Definition
 *
 * Complete definition for visa services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISA_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'visa-services',
  name: 'Visa Services',
  category: 'services',
  description: 'Visa Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "visa services",
      "visa",
      "services",
      "visa software",
      "visa app",
      "visa platform",
      "visa system",
      "visa management",
      "services visa"
  ],

  synonyms: [
      "Visa Services platform",
      "Visa Services software",
      "Visa Services system",
      "visa solution",
      "visa service"
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
      "Build a visa services platform",
      "Create a visa services app",
      "I need a visa services management system",
      "Build a visa services solution",
      "Create a visa services booking system"
  ],
};
