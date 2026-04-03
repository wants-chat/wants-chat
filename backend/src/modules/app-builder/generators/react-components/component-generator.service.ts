import { Injectable } from '@nestjs/common';
import { Component, DataField, ComponentAction, ComponentType, UIStyleVariant } from '../../interfaces/app-builder.types';
import { ResolvedComponent, FieldMapping } from './types/resolved-component.interface';
import { COMPONENT_REGISTRY, getComponentGenerator } from './component.registry';
import { pascalCase, capitalCase } from 'change-case';
import { singular } from 'pluralize';

/**
 * React Component Generator Service
 *
 * Type-safe component generation using the centralized COMPONENT_REGISTRY.
 * All 313+ component types are registered and mapped to their generators.
 */

@Injectable()
export class ReactComponentGeneratorService {
  /**
   * Generate component based on type
   * Uses type-safe registry lookup for all 313+ supported components
   */
  generateComponent(component: Component, entityName: string, uiStyle?: UIStyleVariant): { code: string; imports: string[] } {
    // Map blueprint Component to ResolvedComponent format
    const resolved = this.mapToResolvedComponent(component, entityName, uiStyle);

    // Look up generator from type-safe registry
    const generator = getComponentGenerator(component.type as ComponentType);

    if (generator) {
      try {
        const code = generator(resolved);
        return { code, imports: [] };
      } catch (error) {
        console.error(`Generator for ${component.type} failed:`, error.message);
        return this.generatePlaceholder(component, entityName);
      }
    }

    // If no generator found, return placeholder
    console.warn(`No generator registered for component type: ${component.type}`);
    return this.generatePlaceholder(component, entityName);
  }

  /**
   * Map blueprint Component to ResolvedComponent format
   * This adapter allows us to use existing UI generators from apps/ui/react
   */
  private mapToResolvedComponent(component: Component, entityName: string, uiStyle?: UIStyleVariant): ResolvedComponent {
    const fieldMappings: FieldMapping[] = component.data.fields.map(field => ({
      targetField: field.name,
      sourceField: field.name,
      fallback: undefined,
    }));

    // Add automatic UI field mappings for common transformations
    // These map database fields to UI-friendly structures
    const hasAuthorId = component.data.fields.some(f => f.name === 'author_id');
    const hasFeaturedImage = component.data.fields.some(f => f.name === 'featured_image');
    const hasCreatedAt = component.data.fields.some(f => f.name === 'created_at');
    const hasPublishedAt = component.data.fields.some(f => f.name === 'published_at');
    const hasViewCount = component.data.fields.some(f => f.name === 'view_count');

    // Add author object mapping (backend transformation adds this)
    if (hasAuthorId) {
      fieldMappings.push({ targetField: 'author', sourceField: 'author', fallback: undefined });
    }

    // Add thumbnail mapping (backend transformation adds this)
    if (hasFeaturedImage) {
      fieldMappings.push({ targetField: 'thumbnail', sourceField: 'thumbnail', fallback: undefined });
    }

    // Add formatted date mapping
    if (hasCreatedAt || hasPublishedAt) {
      fieldMappings.push({ targetField: 'date', sourceField: 'date', fallback: undefined });
      fieldMappings.push({ targetField: 'readTime', sourceField: 'readTime', fallback: undefined });
    }

    // Add views mapping
    if (hasViewCount) {
      fieldMappings.push({ targetField: 'views', sourceField: 'views', fallback: undefined });
    }

    // Add blog-specific UI fields only for blog/content components (not tables, forms, etc.)
    const isBlogComponent = component.type.toString().toLowerCase().includes('blog') ||
                            component.type.toString().toLowerCase().includes('post') ||
                            component.type.toString().toLowerCase().includes('article') ||
                            entityName === 'posts' || entityName === 'articles' || entityName === 'blogs';

    if (isBlogComponent) {
      fieldMappings.push({ targetField: 'categoryColor', sourceField: 'categoryColor', fallback: undefined });
      fieldMappings.push({ targetField: 'featured', sourceField: 'featured', fallback: undefined });
      fieldMappings.push({ targetField: 'tags', sourceField: 'tags', fallback: undefined });
    }

    return {
      componentType: component.type,
      dataSource: entityName,
      fieldMappings,
      warnings: [],
      // Pass original component data and title for dynamic generators (forms, etc.)
      data: component.data,
      title: component.title,
      props: component.props,
      // Pass UI style for dynamic styling
      uiStyle,
      // Pass component actions for forms with serverFunction routes
      actions: component.actions,
    };
  }


  /**
   * Generate placeholder component for unsupported types
   */
  private generatePlaceholder(component: Component, entityName: string): { code: string; imports: string[] } {
    const code = `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${pascalCase(component.type)}Component() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{component.title || '${capitalCase(component.type)}'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          Component type "${component.type}" is not yet implemented.
        </p>
      </CardContent>
    </Card>
  );
}`;

    return { code, imports: [] };
  }

  // Helper methods

  private generateColumns(fields: DataField[]): string {
    return fields
      .slice(0, 5)
      .map(field => `<TableHead>${field.label || this.generateLabel(field.name)}</TableHead>`)
      .join('\n              ');
  }

  private generateActionColumn(entityName: string): string {
    return 'Actions';
  }

  private generateTableCells(fields: DataField[]): string {
    return fields
      .slice(0, 5)
      .map(field => {
        if (field.type === 'date') {
          return `<TableCell>{item.${field.name} ? new Date(item.${field.name}).toLocaleDateString() : '-'}</TableCell>`;
        } else if (field.type === 'boolean') {
          return `<TableCell>{item.${field.name} ? 'Yes' : 'No'}</TableCell>`;
        } else {
          return `<TableCell>{item.${field.name} || '-'}</TableCell>`;
        }
      })
      .join('\n                  ');
  }

  private generateFormFields(fields: DataField[], defaultValuesVar?: string): string {
    return fields
      .filter(field => {
        // Filter out hidden fields (like primary keys)
        const inputType = this.mapFieldToInputType(field);
        return inputType !== 'hidden';
      })
      .map(field => {
        const inputType = this.mapFieldToInputType(field);
        const label = field.label || this.generateLabel(field.name);
        const defaultValueProp = defaultValuesVar ? `defaultValue={${defaultValuesVar}.${field.name}}` : '';
        const defaultCheckedProp = defaultValuesVar ? `defaultChecked={${defaultValuesVar}.${field.name}}` : '';

        if (inputType === 'textarea') {
          return `<div className="space-y-2">
              <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
              <Textarea
                id="${field.name}"
                name="${field.name}"
                ${defaultValueProp}
                required={${field.required || false}}
                className="min-h-[100px]"
              />
            </div>`;
        } else if (inputType === 'checkbox') {
          return `<div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="${field.name}"
                name="${field.name}"
                ${defaultCheckedProp}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="${field.name}">${label}</Label>
            </div>`;
        } else if (inputType === 'select') {
          // Check if this is a foreign key select with relation metadata
          const fieldType = field.type;
          if (typeof fieldType === 'object' && fieldType !== null) {
            const ft = fieldType as any;
            if (ft.type === 'select' && ft.relation) {
              const relation = ft.relation as { entity: string; foreignKey: string; displayField: string };
              const relatedEntity = relation.entity;
              const displayField = relation.displayField || 'name';

              return `<div className="space-y-2">
                <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
                <ForeignKeySelect
                  id="${field.name}"
                  name="${field.name}"
                  entity="${relatedEntity}"
                  displayField="${displayField}"
                  ${defaultValueProp}
                  required={${field.required || false}}
                />
              </div>`;
            }
          }

          // Static select (no relation metadata)
          return `<div className="space-y-2">
            <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
            <select
              id="${field.name}"
              name="${field.name}"
              ${defaultValueProp}
              required={${field.required || false}}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Select...</option>
            </select>
          </div>`;
        } else {
          return `<div className="space-y-2">
              <Label htmlFor="${field.name}">${label}${field.required ? ' *' : ''}</Label>
              <Input
                type="${inputType}"
                id="${field.name}"
                name="${field.name}"
                ${defaultValueProp}
                required={${field.required || false}}
              />
            </div>`;
        }
      })
      .join('\n\n            ');
  }

  private generateDetailFields(fields: DataField[]): string {
    return fields
      .filter(field => {
        // Filter out hidden fields (like primary keys)
        const inputType = this.mapFieldToInputType(field);
        return inputType !== 'hidden';
      })
      .map(field => {
        const label = field.label || this.generateLabel(field.name);
        let valueDisplay = `item.${field.name}`;

        const fieldType = field.type;

        // Check if this is a date field
        if (typeof fieldType === 'string' && fieldType === 'date') {
          valueDisplay = `item.${field.name} ? new Date(item.${field.name}).toLocaleDateString() : '-'`;
        }
        // Check if this is a boolean field
        else if (typeof fieldType === 'string' && fieldType === 'boolean') {
          valueDisplay = `item.${field.name} ? 'Yes' : 'No'`;
        }
        // Check if this is a foreign key field (would display UUID - needs enhancement)
        else if (typeof fieldType === 'object' && fieldType !== null) {
          const ft = fieldType as any;
          if (ft.type === 'select' && ft.relation) {
            // TODO: Fetch and display related entity name instead of UUID
            valueDisplay = `item.${field.name} || '-'`;
          } else {
            valueDisplay = `item.${field.name} || '-'`;
          }
        }
        // Default display
        else {
          valueDisplay = `item.${field.name} || '-'`;
        }

        return `<div>
            <p className="text-sm font-medium text-gray-600">${label}</p>
            <p className="mt-1">{${valueDisplay}}</p>
          </div>`;
      })
      .join('\n          ');
  }

  private mapFieldToInputType(field: DataField): string {
    const fieldType = field.type;

    // Handle null/undefined field type
    if (!fieldType) {
      return 'text';
    }

    // Handle complex field types (objects with type and relation)
    if (typeof fieldType === 'object') {
      if (fieldType !== null) {
        const ft = fieldType as any;
        if (ft.type && typeof ft.type === 'string') {
          return ft.type;
        }
      }
      return 'text';
    }

    // Handle simple string field types
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
      hidden: 'hidden',
    };
    return typeMap[fieldType] || 'text';
  }

  private generateLabel(fieldName: string): string {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }


  /**
   * Convert icon name to valid PascalCase for lucide-react imports
   * check-circle → CheckCircle
   * trending-up → TrendingUp
   */
  private getValidIconName(iconName: string): string {
    return iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
