/**
 * Picture Framing App Type Definition
 *
 * Complete definition for picture framing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PICTURE_FRAMING_APP_TYPE: AppTypeDefinition = {
  id: 'picture-framing',
  name: 'Picture Framing',
  category: 'services',
  description: 'Picture Framing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "picture framing",
      "picture",
      "framing",
      "picture software",
      "picture app",
      "picture platform",
      "picture system",
      "picture management",
      "services picture"
  ],

  synonyms: [
      "Picture Framing platform",
      "Picture Framing software",
      "Picture Framing system",
      "picture solution",
      "picture service"
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
      "Build a picture framing platform",
      "Create a picture framing app",
      "I need a picture framing management system",
      "Build a picture framing solution",
      "Create a picture framing booking system"
  ],
};
