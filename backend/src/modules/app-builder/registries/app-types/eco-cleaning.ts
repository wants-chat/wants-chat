/**
 * Eco Cleaning App Type Definition
 *
 * Complete definition for eco cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ECO_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'eco-cleaning',
  name: 'Eco Cleaning',
  category: 'services',
  description: 'Eco Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "eco cleaning",
      "eco",
      "cleaning",
      "eco software",
      "eco app",
      "eco platform",
      "eco system",
      "eco management",
      "services eco"
  ],

  synonyms: [
      "Eco Cleaning platform",
      "Eco Cleaning software",
      "Eco Cleaning system",
      "eco solution",
      "eco service"
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
      "Build a eco cleaning platform",
      "Create a eco cleaning app",
      "I need a eco cleaning management system",
      "Build a eco cleaning solution",
      "Create a eco cleaning booking system"
  ],
};
