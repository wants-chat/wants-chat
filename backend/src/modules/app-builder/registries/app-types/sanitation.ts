/**
 * Sanitation App Type Definition
 *
 * Complete definition for sanitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SANITATION_APP_TYPE: AppTypeDefinition = {
  id: 'sanitation',
  name: 'Sanitation',
  category: 'services',
  description: 'Sanitation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sanitation",
      "sanitation software",
      "sanitation app",
      "sanitation platform",
      "sanitation system",
      "sanitation management",
      "services sanitation"
  ],

  synonyms: [
      "Sanitation platform",
      "Sanitation software",
      "Sanitation system",
      "sanitation solution",
      "sanitation service"
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
      "Build a sanitation platform",
      "Create a sanitation app",
      "I need a sanitation management system",
      "Build a sanitation solution",
      "Create a sanitation booking system"
  ],
};
