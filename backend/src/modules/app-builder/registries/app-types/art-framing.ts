/**
 * Art Framing App Type Definition
 *
 * Complete definition for art framing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_FRAMING_APP_TYPE: AppTypeDefinition = {
  id: 'art-framing',
  name: 'Art Framing',
  category: 'services',
  description: 'Art Framing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "art framing",
      "art",
      "framing",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "services art"
  ],

  synonyms: [
      "Art Framing platform",
      "Art Framing software",
      "Art Framing system",
      "art solution",
      "art service"
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
      "Build a art framing platform",
      "Create a art framing app",
      "I need a art framing management system",
      "Build a art framing solution",
      "Create a art framing booking system"
  ],
};
