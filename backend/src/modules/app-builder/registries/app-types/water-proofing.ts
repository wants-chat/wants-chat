/**
 * Water Proofing App Type Definition
 *
 * Complete definition for water proofing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_PROOFING_APP_TYPE: AppTypeDefinition = {
  id: 'water-proofing',
  name: 'Water Proofing',
  category: 'construction',
  description: 'Water Proofing platform with comprehensive management features',
  icon: 'house',

  keywords: [
      "water proofing",
      "water",
      "proofing",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "trades water"
  ],

  synonyms: [
      "Water Proofing platform",
      "Water Proofing software",
      "Water Proofing system",
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
      "project-bids",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "documents",
      "payments",
      "reviews",
      "gallery",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a water proofing platform",
      "Create a water proofing app",
      "I need a water proofing management system",
      "Build a water proofing solution",
      "Create a water proofing booking system"
  ],
};
