/**
 * Salvage Yard App Type Definition
 *
 * Complete definition for salvage yard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALVAGE_YARD_APP_TYPE: AppTypeDefinition = {
  id: 'salvage-yard',
  name: 'Salvage Yard',
  category: 'services',
  description: 'Salvage Yard platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "salvage yard",
      "salvage",
      "yard",
      "salvage software",
      "salvage app",
      "salvage platform",
      "salvage system",
      "salvage management",
      "services salvage"
  ],

  synonyms: [
      "Salvage Yard platform",
      "Salvage Yard software",
      "Salvage Yard system",
      "salvage solution",
      "salvage service"
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
      "Build a salvage yard platform",
      "Create a salvage yard app",
      "I need a salvage yard management system",
      "Build a salvage yard solution",
      "Create a salvage yard booking system"
  ],
};
