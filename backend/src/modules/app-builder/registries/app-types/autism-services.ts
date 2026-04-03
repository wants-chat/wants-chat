/**
 * Autism Services App Type Definition
 *
 * Complete definition for autism services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTISM_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'autism-services',
  name: 'Autism Services',
  category: 'services',
  description: 'Autism Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "autism services",
      "autism",
      "services",
      "autism software",
      "autism app",
      "autism platform",
      "autism system",
      "autism management",
      "services autism"
  ],

  synonyms: [
      "Autism Services platform",
      "Autism Services software",
      "Autism Services system",
      "autism solution",
      "autism service"
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
      "Build a autism services platform",
      "Create a autism services app",
      "I need a autism services management system",
      "Build a autism services solution",
      "Create a autism services booking system"
  ],
};
