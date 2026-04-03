/**
 * Tool Library App Type Definition
 *
 * Complete definition for tool library applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOOL_LIBRARY_APP_TYPE: AppTypeDefinition = {
  id: 'tool-library',
  name: 'Tool Library',
  category: 'services',
  description: 'Tool Library platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tool library",
      "tool",
      "library",
      "tool software",
      "tool app",
      "tool platform",
      "tool system",
      "tool management",
      "services tool"
  ],

  synonyms: [
      "Tool Library platform",
      "Tool Library software",
      "Tool Library system",
      "tool solution",
      "tool service"
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
      "Build a tool library platform",
      "Create a tool library app",
      "I need a tool library management system",
      "Build a tool library solution",
      "Create a tool library booking system"
  ],
};
