/**
 * Fine Dining App Type Definition
 *
 * Complete definition for fine dining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FINE_DINING_APP_TYPE: AppTypeDefinition = {
  id: 'fine-dining',
  name: 'Fine Dining',
  category: 'services',
  description: 'Fine Dining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fine dining",
      "fine",
      "dining",
      "fine software",
      "fine app",
      "fine platform",
      "fine system",
      "fine management",
      "services fine"
  ],

  synonyms: [
      "Fine Dining platform",
      "Fine Dining software",
      "Fine Dining system",
      "fine solution",
      "fine service"
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
      "Build a fine dining platform",
      "Create a fine dining app",
      "I need a fine dining management system",
      "Build a fine dining solution",
      "Create a fine dining booking system"
  ],
};
