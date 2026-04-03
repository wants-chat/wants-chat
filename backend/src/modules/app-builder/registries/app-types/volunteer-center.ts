/**
 * Volunteer Center App Type Definition
 *
 * Complete definition for volunteer center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLUNTEER_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'volunteer-center',
  name: 'Volunteer Center',
  category: 'services',
  description: 'Volunteer Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "volunteer center",
      "volunteer",
      "center",
      "volunteer software",
      "volunteer app",
      "volunteer platform",
      "volunteer system",
      "volunteer management",
      "services volunteer"
  ],

  synonyms: [
      "Volunteer Center platform",
      "Volunteer Center software",
      "Volunteer Center system",
      "volunteer solution",
      "volunteer service"
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
      "Build a volunteer center platform",
      "Create a volunteer center app",
      "I need a volunteer center management system",
      "Build a volunteer center solution",
      "Create a volunteer center booking system"
  ],
};
