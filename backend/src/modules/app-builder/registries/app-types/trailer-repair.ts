/**
 * Trailer Repair App Type Definition
 *
 * Complete definition for trailer repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAILER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'trailer-repair',
  name: 'Trailer Repair',
  category: 'services',
  description: 'Trailer Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "trailer repair",
      "trailer",
      "repair",
      "trailer software",
      "trailer app",
      "trailer platform",
      "trailer system",
      "trailer management",
      "services trailer"
  ],

  synonyms: [
      "Trailer Repair platform",
      "Trailer Repair software",
      "Trailer Repair system",
      "trailer solution",
      "trailer service"
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
      "Build a trailer repair platform",
      "Create a trailer repair app",
      "I need a trailer repair management system",
      "Build a trailer repair solution",
      "Create a trailer repair booking system"
  ],
};
