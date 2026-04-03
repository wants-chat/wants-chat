/**
 * Terrace Design App Type Definition
 *
 * Complete definition for terrace design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TERRACE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'terrace-design',
  name: 'Terrace Design',
  category: 'services',
  description: 'Terrace Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "terrace design",
      "terrace",
      "design",
      "terrace software",
      "terrace app",
      "terrace platform",
      "terrace system",
      "terrace management",
      "services terrace"
  ],

  synonyms: [
      "Terrace Design platform",
      "Terrace Design software",
      "Terrace Design system",
      "terrace solution",
      "terrace service"
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
      "Build a terrace design platform",
      "Create a terrace design app",
      "I need a terrace design management system",
      "Build a terrace design solution",
      "Create a terrace design booking system"
  ],
};
