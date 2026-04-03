/**
 * Productivity Consulting App Type Definition
 *
 * Complete definition for productivity consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRODUCTIVITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'productivity-consulting',
  name: 'Productivity Consulting',
  category: 'professional-services',
  description: 'Productivity Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "productivity consulting",
      "productivity",
      "consulting",
      "productivity software",
      "productivity app",
      "productivity platform",
      "productivity system",
      "productivity management",
      "consulting productivity"
  ],

  synonyms: [
      "Productivity Consulting platform",
      "Productivity Consulting software",
      "Productivity Consulting system",
      "productivity solution",
      "productivity service"
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
      "Build a productivity consulting platform",
      "Create a productivity consulting app",
      "I need a productivity consulting management system",
      "Build a productivity consulting solution",
      "Create a productivity consulting booking system"
  ],
};
