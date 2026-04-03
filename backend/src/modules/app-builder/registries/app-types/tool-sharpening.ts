/**
 * Tool Sharpening App Type Definition
 *
 * Complete definition for tool sharpening applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOOL_SHARPENING_APP_TYPE: AppTypeDefinition = {
  id: 'tool-sharpening',
  name: 'Tool Sharpening',
  category: 'services',
  description: 'Tool Sharpening platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tool sharpening",
      "tool",
      "sharpening",
      "tool software",
      "tool app",
      "tool platform",
      "tool system",
      "tool management",
      "services tool"
  ],

  synonyms: [
      "Tool Sharpening platform",
      "Tool Sharpening software",
      "Tool Sharpening system",
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
      "Build a tool sharpening platform",
      "Create a tool sharpening app",
      "I need a tool sharpening management system",
      "Build a tool sharpening solution",
      "Create a tool sharpening booking system"
  ],
};
