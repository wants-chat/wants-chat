/**
 * Building Maintenance App Type Definition
 *
 * Complete definition for building maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUILDING_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'building-maintenance',
  name: 'Building Maintenance',
  category: 'services',
  description: 'Building Maintenance platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "building maintenance",
      "building",
      "maintenance",
      "building software",
      "building app",
      "building platform",
      "building system",
      "building management",
      "services building"
  ],

  synonyms: [
      "Building Maintenance platform",
      "Building Maintenance software",
      "Building Maintenance system",
      "building solution",
      "building service"
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
      "Build a building maintenance platform",
      "Create a building maintenance app",
      "I need a building maintenance management system",
      "Build a building maintenance solution",
      "Create a building maintenance booking system"
  ],
};
