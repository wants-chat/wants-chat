/**
 * Alternative Medicine App Type Definition
 *
 * Complete definition for alternative medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALTERNATIVE_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'alternative-medicine',
  name: 'Alternative Medicine',
  category: 'services',
  description: 'Alternative Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "alternative medicine",
      "alternative",
      "medicine",
      "alternative software",
      "alternative app",
      "alternative platform",
      "alternative system",
      "alternative management",
      "services alternative"
  ],

  synonyms: [
      "Alternative Medicine platform",
      "Alternative Medicine software",
      "Alternative Medicine system",
      "alternative solution",
      "alternative service"
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
      "Build a alternative medicine platform",
      "Create a alternative medicine app",
      "I need a alternative medicine management system",
      "Build a alternative medicine solution",
      "Create a alternative medicine booking system"
  ],
};
