/**
 * Visual Design App Type Definition
 *
 * Complete definition for visual design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISUAL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'visual-design',
  name: 'Visual Design',
  category: 'services',
  description: 'Visual Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "visual design",
      "visual",
      "design",
      "visual software",
      "visual app",
      "visual platform",
      "visual system",
      "visual management",
      "services visual"
  ],

  synonyms: [
      "Visual Design platform",
      "Visual Design software",
      "Visual Design system",
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
      "Build a visual design platform",
      "Create a visual design app",
      "I need a visual design management system",
      "Build a visual design solution",
      "Create a visual design booking system"
  ],
};
