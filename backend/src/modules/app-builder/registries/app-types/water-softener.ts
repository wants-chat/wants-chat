/**
 * Water Softener App Type Definition
 *
 * Complete definition for water softener applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_SOFTENER_APP_TYPE: AppTypeDefinition = {
  id: 'water-softener',
  name: 'Water Softener',
  category: 'services',
  description: 'Water Softener platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "water softener",
      "water",
      "softener",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "services water"
  ],

  synonyms: [
      "Water Softener platform",
      "Water Softener software",
      "Water Softener system",
      "water solution",
      "water service"
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
      "Build a water softener platform",
      "Create a water softener app",
      "I need a water softener management system",
      "Build a water softener solution",
      "Create a water softener booking system"
  ],
};
