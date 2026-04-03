/**
 * Indoor Farming App Type Definition
 *
 * Complete definition for indoor farming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDOOR_FARMING_APP_TYPE: AppTypeDefinition = {
  id: 'indoor-farming',
  name: 'Indoor Farming',
  category: 'services',
  description: 'Indoor Farming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "indoor farming",
      "indoor",
      "farming",
      "indoor software",
      "indoor app",
      "indoor platform",
      "indoor system",
      "indoor management",
      "services indoor"
  ],

  synonyms: [
      "Indoor Farming platform",
      "Indoor Farming software",
      "Indoor Farming system",
      "indoor solution",
      "indoor service"
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
      "Build a indoor farming platform",
      "Create a indoor farming app",
      "I need a indoor farming management system",
      "Build a indoor farming solution",
      "Create a indoor farming booking system"
  ],
};
