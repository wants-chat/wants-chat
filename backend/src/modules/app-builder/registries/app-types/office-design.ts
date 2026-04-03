/**
 * Office Design App Type Definition
 *
 * Complete definition for office design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'office-design',
  name: 'Office Design',
  category: 'services',
  description: 'Office Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "office design",
      "office",
      "design",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "services office"
  ],

  synonyms: [
      "Office Design platform",
      "Office Design software",
      "Office Design system",
      "office solution",
      "office service"
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
      "Build a office design platform",
      "Create a office design app",
      "I need a office design management system",
      "Build a office design solution",
      "Create a office design booking system"
  ],
};
