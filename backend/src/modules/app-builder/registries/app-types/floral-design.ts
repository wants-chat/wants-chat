/**
 * Floral Design App Type Definition
 *
 * Complete definition for floral design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLORAL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'floral-design',
  name: 'Floral Design',
  category: 'services',
  description: 'Floral Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "floral design",
      "floral",
      "design",
      "floral software",
      "floral app",
      "floral platform",
      "floral system",
      "floral management",
      "services floral"
  ],

  synonyms: [
      "Floral Design platform",
      "Floral Design software",
      "Floral Design system",
      "floral solution",
      "floral service"
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
      "Build a floral design platform",
      "Create a floral design app",
      "I need a floral design management system",
      "Build a floral design solution",
      "Create a floral design booking system"
  ],
};
