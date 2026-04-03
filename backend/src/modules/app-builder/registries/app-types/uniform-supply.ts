/**
 * Uniform Supply App Type Definition
 *
 * Complete definition for uniform supply applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIFORM_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'uniform-supply',
  name: 'Uniform Supply',
  category: 'services',
  description: 'Uniform Supply platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "uniform supply",
      "uniform",
      "supply",
      "uniform software",
      "uniform app",
      "uniform platform",
      "uniform system",
      "uniform management",
      "services uniform"
  ],

  synonyms: [
      "Uniform Supply platform",
      "Uniform Supply software",
      "Uniform Supply system",
      "uniform solution",
      "uniform service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a uniform supply platform",
      "Create a uniform supply app",
      "I need a uniform supply management system",
      "Build a uniform supply solution",
      "Create a uniform supply booking system"
  ],
};
