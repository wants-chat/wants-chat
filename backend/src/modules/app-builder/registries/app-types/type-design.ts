/**
 * Type Design App Type Definition
 *
 * Complete definition for type design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TYPE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'type-design',
  name: 'Type Design',
  category: 'services',
  description: 'Type Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "type design",
      "type",
      "design",
      "type software",
      "type app",
      "type platform",
      "type system",
      "type management",
      "services type"
  ],

  synonyms: [
      "Type Design platform",
      "Type Design software",
      "Type Design system",
      "type solution",
      "type service"
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
      "Build a type design platform",
      "Create a type design app",
      "I need a type design management system",
      "Build a type design solution",
      "Create a type design booking system"
  ],
};
