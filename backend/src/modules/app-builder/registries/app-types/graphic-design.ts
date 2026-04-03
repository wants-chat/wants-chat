/**
 * Graphic Design App Type Definition
 *
 * Complete definition for graphic design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GRAPHIC_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'graphic-design',
  name: 'Graphic Design',
  category: 'services',
  description: 'Graphic Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "graphic design",
      "graphic",
      "design",
      "graphic software",
      "graphic app",
      "graphic platform",
      "graphic system",
      "graphic management",
      "services graphic"
  ],

  synonyms: [
      "Graphic Design platform",
      "Graphic Design software",
      "Graphic Design system",
      "graphic solution",
      "graphic service"
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
      "Build a graphic design platform",
      "Create a graphic design app",
      "I need a graphic design management system",
      "Build a graphic design solution",
      "Create a graphic design booking system"
  ],
};
