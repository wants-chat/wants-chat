/**
 * Registered Agent App Type Definition
 *
 * Complete definition for registered agent applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REGISTERED_AGENT_APP_TYPE: AppTypeDefinition = {
  id: 'registered-agent',
  name: 'Registered Agent',
  category: 'services',
  description: 'Registered Agent platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "registered agent",
      "registered",
      "agent",
      "registered software",
      "registered app",
      "registered platform",
      "registered system",
      "registered management",
      "services registered"
  ],

  synonyms: [
      "Registered Agent platform",
      "Registered Agent software",
      "Registered Agent system",
      "registered solution",
      "registered service"
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
      "Build a registered agent platform",
      "Create a registered agent app",
      "I need a registered agent management system",
      "Build a registered agent solution",
      "Create a registered agent booking system"
  ],
};
