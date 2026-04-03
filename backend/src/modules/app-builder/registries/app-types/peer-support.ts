/**
 * Peer Support App Type Definition
 *
 * Complete definition for peer support applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEER_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'peer-support',
  name: 'Peer Support',
  category: 'services',
  description: 'Peer Support platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "peer support",
      "peer",
      "support",
      "peer software",
      "peer app",
      "peer platform",
      "peer system",
      "peer management",
      "services peer"
  ],

  synonyms: [
      "Peer Support platform",
      "Peer Support software",
      "Peer Support system",
      "peer solution",
      "peer service"
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
      "Build a peer support platform",
      "Create a peer support app",
      "I need a peer support management system",
      "Build a peer support solution",
      "Create a peer support booking system"
  ],
};
