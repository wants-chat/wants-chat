/**
 * Laser Cutting App Type Definition
 *
 * Complete definition for laser cutting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LASER_CUTTING_APP_TYPE: AppTypeDefinition = {
  id: 'laser-cutting',
  name: 'Laser Cutting',
  category: 'services',
  description: 'Laser Cutting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "laser cutting",
      "laser",
      "cutting",
      "laser software",
      "laser app",
      "laser platform",
      "laser system",
      "laser management",
      "services laser"
  ],

  synonyms: [
      "Laser Cutting platform",
      "Laser Cutting software",
      "Laser Cutting system",
      "laser solution",
      "laser service"
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
      "Build a laser cutting platform",
      "Create a laser cutting app",
      "I need a laser cutting management system",
      "Build a laser cutting solution",
      "Create a laser cutting booking system"
  ],
};
