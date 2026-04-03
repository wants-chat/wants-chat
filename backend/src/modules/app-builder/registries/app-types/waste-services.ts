/**
 * Waste Services App Type Definition
 *
 * Complete definition for waste services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WASTE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'waste-services',
  name: 'Waste Services',
  category: 'services',
  description: 'Waste Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "waste services",
      "waste",
      "services",
      "waste software",
      "waste app",
      "waste platform",
      "waste system",
      "waste management",
      "services waste"
  ],

  synonyms: [
      "Waste Services platform",
      "Waste Services software",
      "Waste Services system",
      "waste solution",
      "waste service"
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
      "Build a waste services platform",
      "Create a waste services app",
      "I need a waste services management system",
      "Build a waste services solution",
      "Create a waste services booking system"
  ],
};
