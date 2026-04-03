/**
 * Server Hosting App Type Definition
 *
 * Complete definition for server hosting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SERVER_HOSTING_APP_TYPE: AppTypeDefinition = {
  id: 'server-hosting',
  name: 'Server Hosting',
  category: 'services',
  description: 'Server Hosting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "server hosting",
      "server",
      "hosting",
      "server software",
      "server app",
      "server platform",
      "server system",
      "server management",
      "services server"
  ],

  synonyms: [
      "Server Hosting platform",
      "Server Hosting software",
      "Server Hosting system",
      "server solution",
      "server service"
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
      "Build a server hosting platform",
      "Create a server hosting app",
      "I need a server hosting management system",
      "Build a server hosting solution",
      "Create a server hosting booking system"
  ],
};
