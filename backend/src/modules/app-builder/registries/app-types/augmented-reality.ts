/**
 * Augmented Reality App Type Definition
 *
 * Complete definition for augmented reality applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUGMENTED_REALITY_APP_TYPE: AppTypeDefinition = {
  id: 'augmented-reality',
  name: 'Augmented Reality',
  category: 'services',
  description: 'Augmented Reality platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "augmented reality",
      "augmented",
      "reality",
      "augmented software",
      "augmented app",
      "augmented platform",
      "augmented system",
      "augmented management",
      "services augmented"
  ],

  synonyms: [
      "Augmented Reality platform",
      "Augmented Reality software",
      "Augmented Reality system",
      "augmented solution",
      "augmented service"
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
      "Build a augmented reality platform",
      "Create a augmented reality app",
      "I need a augmented reality management system",
      "Build a augmented reality solution",
      "Create a augmented reality booking system"
  ],
};
