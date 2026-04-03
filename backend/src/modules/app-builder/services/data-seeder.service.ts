import { Injectable, Logger } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { faker } from '@faker-js/faker';

/**
 * Data Seeder Service for App Builder
 *
 * Seeds realistic data into generated apps after schema creation.
 */
@Injectable()
export class DataSeederService {
  private readonly logger = new Logger(DataSeederService.name);

  // Cache of seeded IDs for foreign key references
  private seededIds: Map<string, string[]> = new Map();

  constructor(private readonly platformService: PlatformService) {}

  /**
   * Seed data for all tables in the app
   * @param onProgress - Optional callback for progress updates (keeps socket alive during long seeding)
   */
  async seedAppData(
    tables: { name: string; columns: any[] }[],
    databaseName: string,
    appType: string,
    appPrefix: string,
    onProgress?: (message: string) => void,
    roles?: Array<{ id: string; name: string; level: number; isDefault: boolean }>,
  ): Promise<void> {
    this.logger.log(`Starting data seeding for ${appType} (${tables.length} tables)`);
    this.seededIds.clear();

    // Helper to report progress
    const progress = (message: string) => {
      if (onProgress) {
        try {
          onProgress(message);
        } catch (e) {
          // Ignore callback errors
        }
      }
    };

    try {
      // First, seed auth.users with app-specific roles
      progress('🌱 Creating sample users...');
      await this.seedAuthUsers(databaseName, appType, roles, progress);

      // Sort tables by dependency (tables without user_id first, then with user_id)
      const sortedTables = this.sortTablesByDependency(tables);

      for (let i = 0; i < sortedTables.length; i++) {
        const table = sortedTables[i];
        progress(`🌱 Seeding ${table.name} (${i + 1}/${sortedTables.length})...`);
        await this.seedTable(table, databaseName, appType, appPrefix);
      }

      this.logger.log(`Successfully seeded data for ${tables.length} tables`);
    } catch (error: any) {
      this.logger.error(`Failed to seed data: ${error.message}`);
    }
  }

  /**
   * Sort tables by dependency - topological sort so dependencies come first
   */
  private sortTablesByDependency(tables: { name: string; columns: any[] }[]): { name: string; columns: any[] }[] {
    // Build dependency graph
    const tableMap = new Map(tables.map(t => [t.name, t]));
    const dependencies = new Map<string, Set<string>>();

    for (const table of tables) {
      const deps = new Set<string>();
      for (const col of table.columns) {
        if (col.name.endsWith('_id') && col.name !== 'id' && col.name !== 'user_id') {
          const refTable = this.guessReferenceTable(col.name, table.name);
          // Skip self-references (parent_id, category_id in categories table)
          if (refTable !== table.name && refTable !== `${table.name}s` && tableMap.has(refTable)) {
            deps.add(refTable);
          }
        }
      }
      dependencies.set(table.name, deps);
    }

    // Topological sort using Kahn's algorithm
    const sorted: { name: string; columns: any[] }[] = [];
    const visited = new Set<string>();
    const inDegree = new Map<string, number>();

    // Calculate in-degrees
    for (const table of tables) {
      inDegree.set(table.name, 0);
    }
    for (const [_, deps] of dependencies) {
      for (const dep of deps) {
        if (inDegree.has(dep)) {
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    // Start with tables that have no dependencies
    const queue: string[] = [];
    for (const [name, degree] of inDegree) {
      if (dependencies.get(name)?.size === 0) {
        queue.push(name);
      }
    }

    while (queue.length > 0) {
      const tableName = queue.shift()!;
      if (visited.has(tableName)) continue;
      visited.add(tableName);

      const table = tableMap.get(tableName);
      if (table) sorted.push(table);

      // Add tables that depend on this one
      for (const [name, deps] of dependencies) {
        if (!visited.has(name) && deps.has(tableName)) {
          deps.delete(tableName);
          if (deps.size === 0) {
            queue.push(name);
          }
        }
      }
    }

    // Add any remaining tables (circular dependencies or isolated)
    for (const table of tables) {
      if (!visited.has(table.name)) {
        sorted.push(table);
      }
    }

    this.logger.log(`Seeding order: ${sorted.map(t => t.name).join(' -> ')}`);
    return sorted;
  }

  /**
   * Seed a single table
   */
  private async seedTable(
    table: { name: string; columns: any[] },
    databaseName: string,
    appType: string,
    appPrefix: string,
  ): Promise<void> {
    // Schema tables have base names (products, categories)
    // Database tables have prefixed names (bookstore_products, bookstore_categories)
    const baseName = table.name;
    const actualTableName = `${appPrefix}_${baseName}`;

    const recordCount = this.getRecordCount(baseName);
    this.logger.log(`Seeding ${recordCount} records for ${actualTableName}...`);

    try {
      const records: any[] = [];
      const recordIds: string[] = [];

      for (let i = 0; i < recordCount; i++) {
        const record = this.generateRecord(table, appType, i);
        if (record) {
          records.push(record);
          if (record.id) recordIds.push(record.id);
        }
      }

      if (records.length > 0) {
        await this.insertRecords(actualTableName, records, databaseName);
        // Store with base name for FK lookups
        this.seededIds.set(baseName, recordIds);
        this.logger.log(`Inserted ${records.length} records into ${actualTableName}`);
      } else {
        this.logger.warn(`No valid records generated for ${actualTableName} (FK dependencies may be missing)`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to seed ${actualTableName}: ${error.message}`);
    }
  }

  /**
   * Generate a record based on column definitions
   */
  private generateRecord(
    table: { name: string; columns: any[] },
    appType: string,
    index: number,
  ): Record<string, any> | null {
    const record: Record<string, any> = {};
    const tableName = table.name.toLowerCase();

    for (const col of table.columns) {
      const colName = col.name;
      const colType = (col.type || 'text').toLowerCase();

      // Skip auto-generated fields
      if (colName === 'id') {
        record[colName] = faker.string.uuid();
        continue;
      }

      // Handle user_id foreign key
      if (colName === 'user_id') {
        const userIds = this.seededIds.get('auth.users');
        if (userIds && userIds.length > 0) {
          record[colName] = userIds[index % userIds.length];
        } else {
          return null; // Skip if no users
        }
        continue;
      }

      // Handle other foreign keys
      if (colName.endsWith('_id')) {
        const refTable = this.guessReferenceTable(colName, table.name);

        // Self-referencing FK (e.g., category_id in categories, parent_id) - allow null
        const isSelfReference = refTable === tableName ||
          refTable === `${tableName}s` ||
          colName === 'parent_id' ||
          colName === 'category_id' && tableName.includes('categor');

        const refIds = this.seededIds.get(refTable);
        if (refIds && refIds.length > 0) {
          record[colName] = refIds[index % refIds.length];
        } else if (isSelfReference) {
          // Self-reference - set to null (parent category optional)
          record[colName] = null;
        } else {
          // FK reference not found - skip this record to avoid NULL constraint
          this.logger.debug(`Skipping record: ${colName} references ${refTable} which has no seeded data`);
          return null;
        }
        continue;
      }

      // Generate value based on column name and type
      record[colName] = this.generateValue(colName, colType, tableName, appType);
    }

    return record;
  }

  /**
   * Generate a value based on column name and type
   */
  private generateValue(colName: string, colType: string, tableName: string, appType: string): any {
    const name = colName.toLowerCase();

    // Timestamps
    if (name === 'created_at' || name === 'updated_at') {
      return new Date().toISOString();
    }

    // Common field names
    if (name === 'name' || name === 'title') {
      if (tableName.includes('product') || tableName.includes('book')) {
        return faker.commerce.productName();
      }
      if (tableName.includes('category')) {
        return faker.commerce.department();
      }
      return faker.lorem.words(3);
    }

    if (name === 'description') {
      return faker.lorem.paragraph();
    }

    if (name === 'email') {
      return faker.internet.email().toLowerCase();
    }

    if (name === 'price') {
      return parseFloat(faker.commerce.price({ min: 10, max: 100 }));
    }

    if (name === 'stock' || name === 'quantity') {
      return faker.number.int({ min: 0, max: 100 });
    }

    if (name === 'rating') {
      return faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
    }

    if (name.includes('image') || name.includes('photo') || name === 'image_url') {
      return this.getProductImage(tableName, appType);
    }

    if (name === 'slug') {
      return faker.lorem.slug();
    }

    if (name === 'sku') {
      return `SKU-${faker.string.alphanumeric(8).toUpperCase()}`;
    }

    if (name === 'status') {
      return faker.helpers.arrayElement(['active', 'pending', 'completed']);
    }

    if (name === 'is_active' || name === 'is_featured') {
      return faker.datatype.boolean();
    }

    if (name === 'content' || name === 'body') {
      return faker.lorem.paragraphs(2);
    }

    if (name === 'author') {
      return faker.person.fullName();
    }

    // Variant-related fields
    if (name === 'variant_name' || name === 'option_name' || name === 'attribute_name') {
      return faker.helpers.arrayElement(['Size', 'Color', 'Material', 'Style']);
    }

    if (name === 'variant_value' || name === 'option_value' || name === 'attribute_value') {
      return faker.helpers.arrayElement(['Small', 'Medium', 'Large', 'Red', 'Blue', 'Cotton', 'Leather']);
    }

    if (name === 'color') {
      return faker.color.human();
    }

    if (name === 'size') {
      return faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    }

    if (name === 'weight') {
      return faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 });
    }

    // Order/address fields
    if (name === 'total' || name === 'subtotal' || name === 'total_amount') {
      return parseFloat(faker.commerce.price({ min: 50, max: 500 }));
    }

    if (name === 'address' || name === 'shipping_address' || name === 'billing_address') {
      return faker.location.streetAddress();
    }

    if (name === 'city') {
      return faker.location.city();
    }

    if (name === 'country') {
      return faker.location.country();
    }

    if (name === 'postal_code' || name === 'zip_code') {
      return faker.location.zipCode();
    }

    if (name === 'phone' || name === 'phone_number') {
      return faker.phone.number();
    }

    // Session fields
    if (name === 'token' || name === 'session_token' || name === 'access_token') {
      return faker.string.alphanumeric(64);
    }

    if (name === 'expires_at' || name === 'expiry') {
      return faker.date.future().toISOString();
    }

    if (name === 'ip_address') {
      return faker.internet.ip();
    }

    if (name === 'user_agent') {
      return faker.internet.userAgent();
    }

    // By type
    if (colType.includes('bool')) {
      return faker.datatype.boolean();
    }

    if (colType.includes('int') || colType === 'number') {
      return faker.number.int({ min: 1, max: 100 });
    }

    if (colType.includes('numeric') || colType === 'decimal') {
      return parseFloat(faker.commerce.price({ min: 1, max: 100 }));
    }

    if (colType.includes('json')) {
      return JSON.stringify({});
    }

    if (colType.includes('timestamp') || colType === 'date') {
      return faker.date.past().toISOString();
    }

    // Default: text
    return faker.lorem.words(2);
  }

  /**
   * Get product image URL based on app type
   */
  private getProductImage(tableName: string, appType: string): string {
    const type = appType.toLowerCase();

    if (type.includes('book') || tableName.includes('book')) {
      return `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/400/600`;
    }

    if (type.includes('food') || type.includes('restaurant')) {
      return `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/600/400`;
    }

    return `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/600/600`;
  }

  /**
   * Guess reference table from foreign key column name
   * Returns base names (e.g., 'products', 'categories') since seededIds stores base names
   */
  private guessReferenceTable(colName: string, currentTable: string): string {
    const baseName = colName.replace('_id', '');

    if (baseName === 'user') return 'auth.users';
    if (baseName === 'category') return 'categories';
    if (baseName === 'product') return 'products';
    if (baseName === 'order') return 'orders';
    if (baseName === 'variant') return 'product_variants';

    // Default: pluralize the base name
    return `${baseName}s`;
  }

  /**
   * Get record count based on table type
   */
  private getRecordCount(tableName: string): number {
    const name = tableName.toLowerCase();

    // Tables to skip seeding (auth.users is seeded separately, cart should be empty)
    if (name === 'users') return 0; // Skip - auth.users is seeded separately
    if (name.includes('cart')) return 0; // Don't seed cart items

    if (name.includes('category')) return 8;
    if (name.includes('product') || name.includes('book')) return 20;
    if (name.includes('review')) return 30;
    if (name.includes('order')) return 15;

    return 10;
  }

  /**
   * Insert records into database
   */
  private async insertRecords(
    tableName: string,
    records: any[],
    databaseName: string,
  ): Promise<void> {
    if (records.length === 0) return;

    const columns = Object.keys(records[0]);
    if (columns.length === 0) {
      this.logger.warn(`No columns found for ${tableName}, skipping insert`);
      return;
    }
    const columnNames = columns.map(c => `"${c}"`).join(', ');

    const values: any[] = [];
    const placeholders: string[] = [];

    records.forEach((record, recordIndex) => {
      const recordPlaceholders: string[] = [];
      columns.forEach((col, colIndex) => {
        const idx = recordIndex * columns.length + colIndex + 1;
        recordPlaceholders.push(`$${idx}`);
        values.push(record[col]);
      });
      placeholders.push(`(${recordPlaceholders.join(', ')})`);
    });

    const sql = `
      INSERT INTO "${tableName}" (${columnNames})
      VALUES ${placeholders.join(', ')}
      ON CONFLICT DO NOTHING
    `;

    await this.platformService.executeOnAppDatabase(databaseName, sql, values);
  }

  /**
   * Seed auth.users table with app-specific roles
   * @param progress - Optional callback for progress updates (keeps socket alive during long bcrypt operations)
   */
  private async seedAuthUsers(
    databaseName: string,
    appType: string,
    roles?: Array<{ id: string; name: string; level: number; isDefault: boolean }>,
    progress?: (message: string) => void,
  ): Promise<void> {
    this.logger.log('Seeding auth.users...');

    const userIds: string[] = [];
    const bcrypt = await import('bcrypt');

    // Build role distribution from app-specific roles
    // Ensure at least one user per role, prioritize by level (higher level = fewer users)
    const roleDistribution = this.buildRoleDistribution(roles);
    this.logger.log(`Role distribution: ${JSON.stringify(roleDistribution)}`);

    const totalUsers = 10;
    for (let i = 1; i <= totalUsers; i++) {
      try {
        // Emit progress for each user (bcrypt takes ~2 seconds per user)
        if (progress) {
          progress(`👤 Creating user ${i}/${totalUsers}...`);
        }

        const userId = faker.string.uuid();
        const hashedPassword = await bcrypt.hash('password123', 10);
        const role = roleDistribution[i - 1] || 'user';
        const fullName = faker.person.fullName();

        await this.platformService.executeOnAppDatabase(
          databaseName,
          `
            INSERT INTO auth.users (id, email, encrypted_password, role, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
            ON CONFLICT (email) DO NOTHING
            RETURNING id
          `,
          [
            userId,
            `user${i}@example.com`,
            hashedPassword,
            role,
            JSON.stringify({ full_name: fullName, avatar_url: `https://i.pravatar.cc/150?img=${i}`, role }),
          ]
        );

        userIds.push(userId);
        this.logger.debug(`Created user${i} with role: ${role}`);
      } catch (error: any) {
        this.logger.warn(`Failed to create user${i}: ${error.message}`);
      }
    }

    // Final progress update for users
    if (progress) {
      progress(`✅ Created ${userIds.length} sample users`);
    }

    this.seededIds.set('auth.users', userIds);
    this.logger.log(`Seeded ${userIds.length} users`);
  }

  /**
   * Build role distribution for seeding users
   * Ensures at least one user per role, with more users for default/lower-level roles
   */
  private buildRoleDistribution(
    roles?: Array<{ id: string; name: string; level: number; isDefault: boolean }>,
  ): string[] {
    // Default fallback if no roles provided
    if (!roles || roles.length === 0) {
      return ['admin', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user'];
    }

    // Sort roles by level (highest first)
    const sortedRoles = [...roles].sort((a, b) => b.level - a.level);
    const distribution: string[] = [];

    // First, ensure at least one user per role (highest level roles first)
    for (const role of sortedRoles) {
      distribution.push(role.id);
    }

    // Fill remaining slots with default role or lowest level role
    const defaultRole = roles.find(r => r.isDefault)?.id || sortedRoles[sortedRoles.length - 1]?.id || 'user';
    while (distribution.length < 10) {
      distribution.push(defaultRole);
    }

    return distribution;
  }
}
