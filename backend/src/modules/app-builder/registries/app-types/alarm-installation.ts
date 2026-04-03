/**
 * Alarm Installation App Type Definition
 *
 * Complete definition for alarm installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALARM_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'alarm-installation',
  name: 'Alarm Installation',
  category: 'services',
  description: 'Alarm Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "alarm installation",
      "alarm",
      "installation",
      "alarm software",
      "alarm app",
      "alarm platform",
      "alarm system",
      "alarm management",
      "services alarm"
  ],

  synonyms: [
      "Alarm Installation platform",
      "Alarm Installation software",
      "Alarm Installation system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a alarm installation platform",
      "Create a alarm installation app",
      "I need a alarm installation management system",
      "Build a alarm installation solution",
      "Create a alarm installation booking system"
  ],
};
