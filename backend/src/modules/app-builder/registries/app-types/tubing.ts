/**
 * Tubing App Type Definition
 *
 * Complete definition for tubing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUBING_APP_TYPE: AppTypeDefinition = {
  id: 'tubing',
  name: 'Tubing',
  category: 'services',
  description: 'Tubing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tubing",
      "tubing software",
      "tubing app",
      "tubing platform",
      "tubing system",
      "tubing management",
      "services tubing"
  ],

  synonyms: [
      "Tubing platform",
      "Tubing software",
      "Tubing system",
      "tubing solution",
      "tubing service"
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
      "Build a tubing platform",
      "Create a tubing app",
      "I need a tubing management system",
      "Build a tubing solution",
      "Create a tubing booking system"
  ],
};
