/**
 * Transport Consulting App Type Definition
 *
 * Complete definition for transport consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSPORT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'transport-consulting',
  name: 'Transport Consulting',
  category: 'professional-services',
  description: 'Transport Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "transport consulting",
      "transport",
      "consulting",
      "transport software",
      "transport app",
      "transport platform",
      "transport system",
      "transport management",
      "consulting transport"
  ],

  synonyms: [
      "Transport Consulting platform",
      "Transport Consulting software",
      "Transport Consulting system",
      "transport solution",
      "transport service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a transport consulting platform",
      "Create a transport consulting app",
      "I need a transport consulting management system",
      "Build a transport consulting solution",
      "Create a transport consulting booking system"
  ],
};
