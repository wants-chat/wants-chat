/**
 * Remote Monitoring App Type Definition
 *
 * Complete definition for remote monitoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REMOTE_MONITORING_APP_TYPE: AppTypeDefinition = {
  id: 'remote-monitoring',
  name: 'Remote Monitoring',
  category: 'services',
  description: 'Remote Monitoring platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "remote monitoring",
      "remote",
      "monitoring",
      "remote software",
      "remote app",
      "remote platform",
      "remote system",
      "remote management",
      "services remote"
  ],

  synonyms: [
      "Remote Monitoring platform",
      "Remote Monitoring software",
      "Remote Monitoring system",
      "remote solution",
      "remote service"
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
      "Build a remote monitoring platform",
      "Create a remote monitoring app",
      "I need a remote monitoring management system",
      "Build a remote monitoring solution",
      "Create a remote monitoring booking system"
  ],
};
