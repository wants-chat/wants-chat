/**
 * Strategic Planning App Type Definition
 *
 * Complete definition for strategic planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRATEGIC_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'strategic-planning',
  name: 'Strategic Planning',
  category: 'services',
  description: 'Strategic Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "strategic planning",
      "strategic",
      "planning",
      "strategic software",
      "strategic app",
      "strategic platform",
      "strategic system",
      "strategic management",
      "services strategic"
  ],

  synonyms: [
      "Strategic Planning platform",
      "Strategic Planning software",
      "Strategic Planning system",
      "strategic solution",
      "strategic service"
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
      "Build a strategic planning platform",
      "Create a strategic planning app",
      "I need a strategic planning management system",
      "Build a strategic planning solution",
      "Create a strategic planning booking system"
  ],
};
