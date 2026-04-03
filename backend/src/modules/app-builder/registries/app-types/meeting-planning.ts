/**
 * Meeting Planning App Type Definition
 *
 * Complete definition for meeting planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEETING_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'meeting-planning',
  name: 'Meeting Planning',
  category: 'services',
  description: 'Meeting Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "meeting planning",
      "meeting",
      "planning",
      "meeting software",
      "meeting app",
      "meeting platform",
      "meeting system",
      "meeting management",
      "services meeting"
  ],

  synonyms: [
      "Meeting Planning platform",
      "Meeting Planning software",
      "Meeting Planning system",
      "meeting solution",
      "meeting service"
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
      "Build a meeting planning platform",
      "Create a meeting planning app",
      "I need a meeting planning management system",
      "Build a meeting planning solution",
      "Create a meeting planning booking system"
  ],
};
