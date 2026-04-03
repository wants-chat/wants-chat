/**
 * Venture Capital App Type Definition
 *
 * Complete definition for venture capital applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENTURE_CAPITAL_APP_TYPE: AppTypeDefinition = {
  id: 'venture-capital',
  name: 'Venture Capital',
  category: 'services',
  description: 'Venture Capital platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "venture capital",
      "venture",
      "capital",
      "venture software",
      "venture app",
      "venture platform",
      "venture system",
      "venture management",
      "services venture"
  ],

  synonyms: [
      "Venture Capital platform",
      "Venture Capital software",
      "Venture Capital system",
      "venture solution",
      "venture service"
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
      "Build a venture capital platform",
      "Create a venture capital app",
      "I need a venture capital management system",
      "Build a venture capital solution",
      "Create a venture capital booking system"
  ],
};
