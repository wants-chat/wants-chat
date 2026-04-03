/**
 * Septic Tank App Type Definition
 *
 * Complete definition for septic tank applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEPTIC_TANK_APP_TYPE: AppTypeDefinition = {
  id: 'septic-tank',
  name: 'Septic Tank',
  category: 'services',
  description: 'Septic Tank platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "septic tank",
      "septic",
      "tank",
      "septic software",
      "septic app",
      "septic platform",
      "septic system",
      "septic management",
      "services septic"
  ],

  synonyms: [
      "Septic Tank platform",
      "Septic Tank software",
      "Septic Tank system",
      "septic solution",
      "septic service"
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
      "Build a septic tank platform",
      "Create a septic tank app",
      "I need a septic tank management system",
      "Build a septic tank solution",
      "Create a septic tank booking system"
  ],
};
