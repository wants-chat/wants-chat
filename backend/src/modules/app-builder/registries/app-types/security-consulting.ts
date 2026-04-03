/**
 * Security Consulting App Type Definition
 *
 * Complete definition for security consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'security-consulting',
  name: 'Security Consulting',
  category: 'professional-services',
  description: 'Security Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "security consulting",
      "security",
      "consulting",
      "security software",
      "security app",
      "security platform",
      "security system",
      "security management",
      "consulting security"
  ],

  synonyms: [
      "Security Consulting platform",
      "Security Consulting software",
      "Security Consulting system",
      "security solution",
      "security service"
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
      "Build a security consulting platform",
      "Create a security consulting app",
      "I need a security consulting management system",
      "Build a security consulting solution",
      "Create a security consulting booking system"
  ],
};
