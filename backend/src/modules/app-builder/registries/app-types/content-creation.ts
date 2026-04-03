/**
 * Content Creation App Type Definition
 *
 * Complete definition for content creation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONTENT_CREATION_APP_TYPE: AppTypeDefinition = {
  id: 'content-creation',
  name: 'Content Creation',
  category: 'services',
  description: 'Content Creation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "content creation",
      "content",
      "creation",
      "content software",
      "content app",
      "content platform",
      "content system",
      "content management",
      "services content"
  ],

  synonyms: [
      "Content Creation platform",
      "Content Creation software",
      "Content Creation system",
      "content solution",
      "content service"
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
      "Build a content creation platform",
      "Create a content creation app",
      "I need a content creation management system",
      "Build a content creation solution",
      "Create a content creation booking system"
  ],
};
