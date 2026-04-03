/**
 * Tunnel App Type Definition
 *
 * Complete definition for tunnel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUNNEL_APP_TYPE: AppTypeDefinition = {
  id: 'tunnel',
  name: 'Tunnel',
  category: 'services',
  description: 'Tunnel platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tunnel",
      "tunnel software",
      "tunnel app",
      "tunnel platform",
      "tunnel system",
      "tunnel management",
      "services tunnel"
  ],

  synonyms: [
      "Tunnel platform",
      "Tunnel software",
      "Tunnel system",
      "tunnel solution",
      "tunnel service"
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
      "Build a tunnel platform",
      "Create a tunnel app",
      "I need a tunnel management system",
      "Build a tunnel solution",
      "Create a tunnel booking system"
  ],
};
