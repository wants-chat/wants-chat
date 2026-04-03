/**
 * Urban Design App Type Definition
 *
 * Complete definition for urban design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const URBAN_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'urban-design',
  name: 'Urban Design',
  category: 'services',
  description: 'Urban Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "urban design",
      "urban",
      "design",
      "urban software",
      "urban app",
      "urban platform",
      "urban system",
      "urban management",
      "services urban"
  ],

  synonyms: [
      "Urban Design platform",
      "Urban Design software",
      "Urban Design system",
      "urban solution",
      "urban service"
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
      "Build a urban design platform",
      "Create a urban design app",
      "I need a urban design management system",
      "Build a urban design solution",
      "Create a urban design booking system"
  ],
};
