/**
 * Garden Maintenance App Type Definition
 *
 * Complete definition for garden maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GARDEN_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'garden-maintenance',
  name: 'Garden Maintenance',
  category: 'services',
  description: 'Garden Maintenance platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "garden maintenance",
      "garden",
      "maintenance",
      "garden software",
      "garden app",
      "garden platform",
      "garden system",
      "garden management",
      "services garden"
  ],

  synonyms: [
      "Garden Maintenance platform",
      "Garden Maintenance software",
      "Garden Maintenance system",
      "garden solution",
      "garden service"
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
      "Build a garden maintenance platform",
      "Create a garden maintenance app",
      "I need a garden maintenance management system",
      "Build a garden maintenance solution",
      "Create a garden maintenance booking system"
  ],
};
