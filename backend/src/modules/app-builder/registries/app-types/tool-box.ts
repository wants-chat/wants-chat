/**
 * Tool Box App Type Definition
 *
 * Complete definition for tool box applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOOL_BOX_APP_TYPE: AppTypeDefinition = {
  id: 'tool-box',
  name: 'Tool Box',
  category: 'services',
  description: 'Tool Box platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tool box",
      "tool",
      "box",
      "tool software",
      "tool app",
      "tool platform",
      "tool system",
      "tool management",
      "services tool"
  ],

  synonyms: [
      "Tool Box platform",
      "Tool Box software",
      "Tool Box system",
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
      "Build a tool box platform",
      "Create a tool box app",
      "I need a tool box management system",
      "Build a tool box solution",
      "Create a tool box booking system"
  ],
};
