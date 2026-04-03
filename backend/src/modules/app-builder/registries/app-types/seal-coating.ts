/**
 * Seal Coating App Type Definition
 *
 * Complete definition for seal coating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEAL_COATING_APP_TYPE: AppTypeDefinition = {
  id: 'seal-coating',
  name: 'Seal Coating',
  category: 'services',
  description: 'Seal Coating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "seal coating",
      "seal",
      "coating",
      "seal software",
      "seal app",
      "seal platform",
      "seal system",
      "seal management",
      "services seal"
  ],

  synonyms: [
      "Seal Coating platform",
      "Seal Coating software",
      "Seal Coating system",
      "seal solution",
      "seal service"
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
      "Build a seal coating platform",
      "Create a seal coating app",
      "I need a seal coating management system",
      "Build a seal coating solution",
      "Create a seal coating booking system"
  ],
};
