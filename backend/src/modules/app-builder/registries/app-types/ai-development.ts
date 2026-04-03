/**
 * Ai Development App Type Definition
 *
 * Complete definition for ai development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AI_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'ai-development',
  name: 'Ai Development',
  category: 'services',
  description: 'Ai Development platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ai development",
      "development",
      "ai software",
      "ai app",
      "ai platform",
      "ai system",
      "ai management",
      "services ai"
  ],

  synonyms: [
      "Ai Development platform",
      "Ai Development software",
      "Ai Development system",
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
      "Build a ai development platform",
      "Create a ai development app",
      "I need a ai development management system",
      "Build a ai development solution",
      "Create a ai development booking system"
  ],
};
