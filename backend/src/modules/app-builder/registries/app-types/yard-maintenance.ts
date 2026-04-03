/**
 * Yard Maintenance App Type Definition
 *
 * Complete definition for yard maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'yard-maintenance',
  name: 'Yard Maintenance',
  category: 'services',
  description: 'Yard Maintenance platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "yard maintenance",
      "yard",
      "maintenance",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "services yard"
  ],

  synonyms: [
      "Yard Maintenance platform",
      "Yard Maintenance software",
      "Yard Maintenance system",
      "yard solution",
      "yard service"
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
      "Build a yard maintenance platform",
      "Create a yard maintenance app",
      "I need a yard maintenance management system",
      "Build a yard maintenance solution",
      "Create a yard maintenance booking system"
  ],
};
