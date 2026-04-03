/**
 * Icon Design App Type Definition
 *
 * Complete definition for icon design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ICON_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'icon-design',
  name: 'Icon Design',
  category: 'services',
  description: 'Icon Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "icon design",
      "icon",
      "design",
      "icon software",
      "icon app",
      "icon platform",
      "icon system",
      "icon management",
      "services icon"
  ],

  synonyms: [
      "Icon Design platform",
      "Icon Design software",
      "Icon Design system",
      "icon solution",
      "icon service"
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
      "Build a icon design platform",
      "Create a icon design app",
      "I need a icon design management system",
      "Build a icon design solution",
      "Create a icon design booking system"
  ],
};
