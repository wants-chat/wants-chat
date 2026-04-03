/**
 * Alarm Response App Type Definition
 *
 * Complete definition for alarm response applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALARM_RESPONSE_APP_TYPE: AppTypeDefinition = {
  id: 'alarm-response',
  name: 'Alarm Response',
  category: 'services',
  description: 'Alarm Response platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "alarm response",
      "alarm",
      "response",
      "alarm software",
      "alarm app",
      "alarm platform",
      "alarm system",
      "alarm management",
      "services alarm"
  ],

  synonyms: [
      "Alarm Response platform",
      "Alarm Response software",
      "Alarm Response system",
      "alarm solution",
      "alarm service"
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
      "Build a alarm response platform",
      "Create a alarm response app",
      "I need a alarm response management system",
      "Build a alarm response solution",
      "Create a alarm response booking system"
  ],
};
