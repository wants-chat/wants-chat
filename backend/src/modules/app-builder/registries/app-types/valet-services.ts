/**
 * Valet Services App Type Definition
 *
 * Complete definition for valet services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VALET_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'valet-services',
  name: 'Valet Services',
  category: 'services',
  description: 'Valet Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "valet services",
      "valet",
      "services",
      "valet software",
      "valet app",
      "valet platform",
      "valet system",
      "valet management",
      "services valet"
  ],

  synonyms: [
      "Valet Services platform",
      "Valet Services software",
      "Valet Services system",
      "valet solution",
      "valet service"
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
      "Build a valet services platform",
      "Create a valet services app",
      "I need a valet services management system",
      "Build a valet services solution",
      "Create a valet services booking system"
  ],
};
