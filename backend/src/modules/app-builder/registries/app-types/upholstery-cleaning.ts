/**
 * Upholstery Cleaning App Type Definition
 *
 * Complete definition for upholstery cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UPHOLSTERY_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'upholstery-cleaning',
  name: 'Upholstery Cleaning',
  category: 'services',
  description: 'Upholstery Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "upholstery cleaning",
      "upholstery",
      "cleaning",
      "upholstery software",
      "upholstery app",
      "upholstery platform",
      "upholstery system",
      "upholstery management",
      "services upholstery"
  ],

  synonyms: [
      "Upholstery Cleaning platform",
      "Upholstery Cleaning software",
      "Upholstery Cleaning system",
      "upholstery solution",
      "upholstery service"
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
      "Build a upholstery cleaning platform",
      "Create a upholstery cleaning app",
      "I need a upholstery cleaning management system",
      "Build a upholstery cleaning solution",
      "Create a upholstery cleaning booking system"
  ],
};
