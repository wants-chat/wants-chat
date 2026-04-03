/**
 * Authentic Cuisine App Type Definition
 *
 * Complete definition for authentic cuisine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTHENTIC_CUISINE_APP_TYPE: AppTypeDefinition = {
  id: 'authentic-cuisine',
  name: 'Authentic Cuisine',
  category: 'services',
  description: 'Authentic Cuisine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "authentic cuisine",
      "authentic",
      "cuisine",
      "authentic software",
      "authentic app",
      "authentic platform",
      "authentic system",
      "authentic management",
      "services authentic"
  ],

  synonyms: [
      "Authentic Cuisine platform",
      "Authentic Cuisine software",
      "Authentic Cuisine system",
      "authentic solution",
      "authentic service"
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
      "Build a authentic cuisine platform",
      "Create a authentic cuisine app",
      "I need a authentic cuisine management system",
      "Build a authentic cuisine solution",
      "Create a authentic cuisine booking system"
  ],
};
