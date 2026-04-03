/**
 * Natural Medicine App Type Definition
 *
 * Complete definition for natural medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NATURAL_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'natural-medicine',
  name: 'Natural Medicine',
  category: 'services',
  description: 'Natural Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "natural medicine",
      "natural",
      "medicine",
      "natural software",
      "natural app",
      "natural platform",
      "natural system",
      "natural management",
      "services natural"
  ],

  synonyms: [
      "Natural Medicine platform",
      "Natural Medicine software",
      "Natural Medicine system",
      "natural solution",
      "natural service"
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
      "Build a natural medicine platform",
      "Create a natural medicine app",
      "I need a natural medicine management system",
      "Build a natural medicine solution",
      "Create a natural medicine booking system"
  ],
};
