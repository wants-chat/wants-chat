/**
 * Whiteboard App Type Definition
 *
 * Complete definition for whiteboard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHITEBOARD_APP_TYPE: AppTypeDefinition = {
  id: 'whiteboard',
  name: 'Whiteboard',
  category: 'services',
  description: 'Whiteboard platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "whiteboard",
      "whiteboard software",
      "whiteboard app",
      "whiteboard platform",
      "whiteboard system",
      "whiteboard management",
      "services whiteboard"
  ],

  synonyms: [
      "Whiteboard platform",
      "Whiteboard software",
      "Whiteboard system",
      "whiteboard solution",
      "whiteboard service"
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
      "Build a whiteboard platform",
      "Create a whiteboard app",
      "I need a whiteboard management system",
      "Build a whiteboard solution",
      "Create a whiteboard booking system"
  ],
};
