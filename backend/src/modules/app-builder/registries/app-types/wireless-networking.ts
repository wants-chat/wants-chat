/**
 * Wireless Networking App Type Definition
 *
 * Complete definition for wireless networking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIRELESS_NETWORKING_APP_TYPE: AppTypeDefinition = {
  id: 'wireless-networking',
  name: 'Wireless Networking',
  category: 'services',
  description: 'Wireless Networking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wireless networking",
      "wireless",
      "networking",
      "wireless software",
      "wireless app",
      "wireless platform",
      "wireless system",
      "wireless management",
      "services wireless"
  ],

  synonyms: [
      "Wireless Networking platform",
      "Wireless Networking software",
      "Wireless Networking system",
      "wireless solution",
      "wireless service"
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
      "Build a wireless networking platform",
      "Create a wireless networking app",
      "I need a wireless networking management system",
      "Build a wireless networking solution",
      "Create a wireless networking booking system"
  ],
};
