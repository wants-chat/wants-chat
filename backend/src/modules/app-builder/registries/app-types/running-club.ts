/**
 * Running Club App Type Definition
 *
 * Complete definition for running club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RUNNING_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'running-club',
  name: 'Running Club',
  category: 'services',
  description: 'Running Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "running club",
      "running",
      "club",
      "running software",
      "running app",
      "running platform",
      "running system",
      "running management",
      "services running"
  ],

  synonyms: [
      "Running Club platform",
      "Running Club software",
      "Running Club system",
      "running solution",
      "running service"
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
      "Build a running club platform",
      "Create a running club app",
      "I need a running club management system",
      "Build a running club solution",
      "Create a running club booking system"
  ],
};
