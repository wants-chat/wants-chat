/**
 * Model Agency App Type Definition
 *
 * Complete definition for model agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MODEL_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'model-agency',
  name: 'Model Agency',
  category: 'services',
  description: 'Model Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "model agency",
      "model",
      "agency",
      "model software",
      "model app",
      "model platform",
      "model system",
      "model management",
      "services model"
  ],

  synonyms: [
      "Model Agency platform",
      "Model Agency software",
      "Model Agency system",
      "model solution",
      "model service"
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
      "Build a model agency platform",
      "Create a model agency app",
      "I need a model agency management system",
      "Build a model agency solution",
      "Create a model agency booking system"
  ],
};
