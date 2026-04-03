/**
 * Weather Station App Type Definition
 *
 * Complete definition for weather station applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEATHER_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'weather-station',
  name: 'Weather Station',
  category: 'services',
  description: 'Weather Station platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "weather station",
      "weather",
      "station",
      "weather software",
      "weather app",
      "weather platform",
      "weather system",
      "weather management",
      "services weather"
  ],

  synonyms: [
      "Weather Station platform",
      "Weather Station software",
      "Weather Station system",
      "weather solution",
      "weather service"
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
      "Build a weather station platform",
      "Create a weather station app",
      "I need a weather station management system",
      "Build a weather station solution",
      "Create a weather station booking system"
  ],
};
