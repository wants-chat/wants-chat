/**
 * Sight Seeing App Type Definition
 *
 * Complete definition for sight seeing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIGHT_SEEING_APP_TYPE: AppTypeDefinition = {
  id: 'sight-seeing',
  name: 'Sight Seeing',
  category: 'services',
  description: 'Sight Seeing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sight seeing",
      "sight",
      "seeing",
      "sight software",
      "sight app",
      "sight platform",
      "sight system",
      "sight management",
      "services sight"
  ],

  synonyms: [
      "Sight Seeing platform",
      "Sight Seeing software",
      "Sight Seeing system",
      "sight solution",
      "sight service"
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
      "Build a sight seeing platform",
      "Create a sight seeing app",
      "I need a sight seeing management system",
      "Build a sight seeing solution",
      "Create a sight seeing booking system"
  ],
};
