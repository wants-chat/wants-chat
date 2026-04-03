/**
 * Visual Effects App Type Definition
 *
 * Complete definition for visual effects applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISUAL_EFFECTS_APP_TYPE: AppTypeDefinition = {
  id: 'visual-effects',
  name: 'Visual Effects',
  category: 'services',
  description: 'Visual Effects platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "visual effects",
      "visual",
      "effects",
      "visual software",
      "visual app",
      "visual platform",
      "visual system",
      "visual management",
      "services visual"
  ],

  synonyms: [
      "Visual Effects platform",
      "Visual Effects software",
      "Visual Effects system",
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
      "Build a visual effects platform",
      "Create a visual effects app",
      "I need a visual effects management system",
      "Build a visual effects solution",
      "Create a visual effects booking system"
  ],
};
