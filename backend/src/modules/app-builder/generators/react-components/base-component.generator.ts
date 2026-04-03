import { Component, DataField } from '../../interfaces/app-builder.types';

/**
 * Base Component Generator
 *
 * Provides common utilities for generating React components from blueprint components
 */

export interface ComponentGeneratorContext {
  component: Component;
  entityName: string;
  imports: Set<string>;
}

export abstract class BaseComponentGenerator {
  /**
   * Generate the React component code
   */
  abstract generate(context: ComponentGeneratorContext): string;

  /**
   * Get required imports for this component
   */
  abstract getImports(): string[];

  /**
   * Get required dependencies (npm packages)
   */
  abstract getDependencies(): string[];

  /**
   * Map database field type to React input type
   */
  protected mapFieldToInputType(field: DataField): string {
    const typeMap: Record<string, string> = {
      text: 'text',
      number: 'number',
      date: 'date',
      boolean: 'checkbox',
      email: 'email',
      phone: 'tel',
      url: 'url',
      file: 'file',
      textarea: 'textarea',
      select: 'select',
    };
    return typeMap[field.type] || 'text';
  }

  /**
   * Generate label from field name
   */
  protected generateLabel(fieldName: string): string {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  /**
   * Capitalize string
   */
  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Singularize entity name
   */
  protected singularize(name: string): string {
    if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
    if (name.endsWith('ses')) return name.slice(0, -2);
    if (name.endsWith('s')) return name.slice(0, -1);
    return name;
  }

  /**
   * Convert snake_case to camelCase
   */
  protected toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Convert camelCase to kebab-case
   */
  protected toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Generate column definitions for table
   */
  protected generateColumns(fields: DataField[]): string {
    return fields
      .slice(0, 5) // Limit to first 5 fields for table display
      .map(
        field => `
    {
      accessorKey: '${field.name}',
      header: '${field.label || this.generateLabel(field.name)}',
    }`,
      )
      .join(',');
  }

  /**
   * Generate form fields JSX
   */
  protected generateFormFields(fields: DataField[]): string {
    return fields
      .filter(f => !['id', 'created_at', 'updated_at'].includes(f.name))
      .map(field => {
        const inputType = this.mapFieldToInputType(field);
        const label = field.label || this.generateLabel(field.name);

        if (inputType === 'textarea') {
          return `
        <div className="space-y-2">
          <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
          <Textarea
            id="${field.name}"
            name="${field.name}"
            required={${field.required || false}}
            className="min-h-[100px]"
          />
        </div>`;
        } else if (inputType === 'checkbox') {
          return `
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="${field.name}"
            name="${field.name}"
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="${field.name}">${label}</Label>
        </div>`;
        } else if (inputType === 'select') {
          return `
        <div className="space-y-2">
          <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
          <select
            id="${field.name}"
            name="${field.name}"
            required={${field.required || false}}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Select...</option>
          </select>
        </div>`;
        } else {
          return `
        <div className="space-y-2">
          <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
          <Input
            type="${inputType}"
            id="${field.name}"
            name="${field.name}"
            required={${field.required || false}}
          />
        </div>`;
        }
      })
      .join('\n');
  }
}
