/**
 * Sensor Technology App Type Definition
 *
 * Complete definition for sensor technology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENSOR_TECHNOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'sensor-technology',
  name: 'Sensor Technology',
  category: 'technology',
  description: 'Sensor Technology platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "sensor technology",
      "sensor",
      "technology",
      "sensor software",
      "sensor app",
      "sensor platform",
      "sensor system",
      "sensor management",
      "technology sensor"
  ],

  synonyms: [
      "Sensor Technology platform",
      "Sensor Technology software",
      "Sensor Technology system",
      "sensor solution",
      "sensor service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a sensor technology platform",
      "Create a sensor technology app",
      "I need a sensor technology management system",
      "Build a sensor technology solution",
      "Create a sensor technology booking system"
  ],
};
