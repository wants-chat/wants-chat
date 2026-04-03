/**
 * Textile Design App Type Definition
 *
 * Complete definition for textile design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEXTILE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'textile-design',
  name: 'Textile Design',
  category: 'services',
  description: 'Textile Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "textile design",
      "textile",
      "design",
      "textile software",
      "textile app",
      "textile platform",
      "textile system",
      "textile management",
      "services textile"
  ],

  synonyms: [
      "Textile Design platform",
      "Textile Design software",
      "Textile Design system",
      "textile solution",
      "textile service"
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
      "Build a textile design platform",
      "Create a textile design app",
      "I need a textile design management system",
      "Build a textile design solution",
      "Create a textile design booking system"
  ],
};
