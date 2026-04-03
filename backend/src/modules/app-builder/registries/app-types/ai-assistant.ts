/**
 * Ai Assistant App Type Definition
 *
 * Complete definition for ai assistant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AI_ASSISTANT_APP_TYPE: AppTypeDefinition = {
  id: 'ai-assistant',
  name: 'Ai Assistant',
  category: 'services',
  description: 'Ai Assistant platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ai assistant",
      "assistant",
      "ai software",
      "ai app",
      "ai platform",
      "ai system",
      "ai management",
      "services ai"
  ],

  synonyms: [
      "Ai Assistant platform",
      "Ai Assistant software",
      "Ai Assistant system",
      "ai solution",
      "ai service"
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
      "Build a ai assistant platform",
      "Create a ai assistant app",
      "I need a ai assistant management system",
      "Build a ai assistant solution",
      "Create a ai assistant booking system"
  ],
};
