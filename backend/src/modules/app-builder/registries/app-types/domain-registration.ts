/**
 * Domain Registration App Type Definition
 *
 * Complete definition for domain registration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOMAIN_REGISTRATION_APP_TYPE: AppTypeDefinition = {
  id: 'domain-registration',
  name: 'Domain Registration',
  category: 'services',
  description: 'Domain Registration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "domain registration",
      "domain",
      "registration",
      "domain software",
      "domain app",
      "domain platform",
      "domain system",
      "domain management",
      "services domain"
  ],

  synonyms: [
      "Domain Registration platform",
      "Domain Registration software",
      "Domain Registration system",
      "domain solution",
      "domain service"
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
      "Build a domain registration platform",
      "Create a domain registration app",
      "I need a domain registration management system",
      "Build a domain registration solution",
      "Create a domain registration booking system"
  ],
};
