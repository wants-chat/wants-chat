/**
 * Garden Design App Type Definition
 *
 * Complete definition for garden design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GARDEN_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'garden-design',
  name: 'Garden Design',
  category: 'services',
  description: 'Garden Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "garden design",
      "garden",
      "design",
      "garden software",
      "garden app",
      "garden platform",
      "garden system",
      "garden management",
      "services garden"
  ],

  synonyms: [
      "Garden Design platform",
      "Garden Design software",
      "Garden Design system",
      "garden solution",
      "garden service"
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
      "Build a garden design platform",
      "Create a garden design app",
      "I need a garden design management system",
      "Build a garden design solution",
      "Create a garden design booking system"
  ],
};
