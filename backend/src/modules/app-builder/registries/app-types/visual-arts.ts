/**
 * Visual Arts App Type Definition
 *
 * Complete definition for visual arts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISUAL_ARTS_APP_TYPE: AppTypeDefinition = {
  id: 'visual-arts',
  name: 'Visual Arts',
  category: 'services',
  description: 'Visual Arts platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "visual arts",
      "visual",
      "arts",
      "visual software",
      "visual app",
      "visual platform",
      "visual system",
      "visual management",
      "services visual"
  ],

  synonyms: [
      "Visual Arts platform",
      "Visual Arts software",
      "Visual Arts system",
      "visual solution",
      "visual service"
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
      "Build a visual arts platform",
      "Create a visual arts app",
      "I need a visual arts management system",
      "Build a visual arts solution",
      "Create a visual arts booking system"
  ],
};
