/**
 * Attic Insulation App Type Definition
 *
 * Complete definition for attic insulation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATTIC_INSULATION_APP_TYPE: AppTypeDefinition = {
  id: 'attic-insulation',
  name: 'Attic Insulation',
  category: 'services',
  description: 'Attic Insulation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "attic insulation",
      "attic",
      "insulation",
      "attic software",
      "attic app",
      "attic platform",
      "attic system",
      "attic management",
      "services attic"
  ],

  synonyms: [
      "Attic Insulation platform",
      "Attic Insulation software",
      "Attic Insulation system",
      "attic solution",
      "attic service"
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
      "Build a attic insulation platform",
      "Create a attic insulation app",
      "I need a attic insulation management system",
      "Build a attic insulation solution",
      "Create a attic insulation booking system"
  ],
};
