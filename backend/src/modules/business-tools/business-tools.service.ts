import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// ============================================
// INTERFACES
// ============================================

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  type: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor';
  status: 'active' | 'inactive' | 'archived';
  source?: string;
  tags?: string[];
  total_spent: number;
  total_invoices: number;
  outstanding_balance: number;
  currency: string;
  notes?: string;
  custom_fields?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
  budget_amount?: number;
  parent_id?: string;
  is_default: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  currency: string;
  category_id?: string;
  payment_method?: string;
  merchant?: string;
  expense_date: Date;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  is_recurring: boolean;
  is_tax_deductible: boolean;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  category?: ExpenseCategory;
}

export interface ProductCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  cost_price?: number;
  selling_price?: number;
  currency: string;
  quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  reorder_point?: number;
  unit: string;
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  is_trackable: boolean;
  image_url?: string;
  images?: string[];
  supplier_id?: string;
  location?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  category?: ProductCategory;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  currency: string;
  issue_date: Date;
  due_date?: Date;
  paid_date?: Date;
  notes?: string;
  terms?: string;
  footer?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  items?: InvoiceItem[];
  customer?: Customer;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  product_id?: string;
  sort_order: number;
  created_at: Date;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class BusinessToolsService {
  private readonly logger = new Logger(BusinessToolsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // CUSTOMERS CRUD
  // ============================================

  async createCustomer(userId: string, data: Partial<Customer>): Promise<Customer> {
    const customer = await this.db.insert<Customer>('customers', {
      user_id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      type: data.type || 'customer',
      status: data.status || 'active',
      source: data.source,
      tags: data.tags || [],
      notes: data.notes,
      custom_fields: data.custom_fields || {},
      metadata: data.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`Customer created: ${customer.id} for user ${userId}`);
    return customer;
  }

  async getCustomers(userId: string, options: QueryOptions & { type?: string; status?: string } = {}): Promise<{
    items: Customer[];
    total: number;
  }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'DESC';

    let whereClause = 'user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(options.type);
      paramIndex++;
    }

    if (options.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM customers WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await this.db.query<Customer>(
      `SELECT * FROM customers WHERE ${whereClause} ORDER BY "${orderBy}" ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return { items: result.rows, total };
  }

  async getCustomer(userId: string, customerId: string): Promise<Customer> {
    const customer = await this.db.findOne<Customer>('customers', { id: customerId, user_id: userId });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async updateCustomer(userId: string, customerId: string, data: Partial<Customer>): Promise<Customer> {
    await this.getCustomer(userId, customerId);

    const [updated] = await this.db.update<Customer>(
      'customers',
      { id: customerId, user_id: userId },
      { ...data, updated_at: new Date() },
    );

    return updated;
  }

  async deleteCustomer(userId: string, customerId: string): Promise<void> {
    await this.getCustomer(userId, customerId);
    await this.db.delete('customers', { id: customerId, user_id: userId });
  }

  // ============================================
  // EXPENSES CRUD
  // ============================================

  async createExpenseCategory(userId: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    return this.db.insert<ExpenseCategory>('expense_categories', {
      user_id: userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      budget_amount: data.budget_amount,
      parent_id: data.parent_id,
      is_default: data.is_default || false,
      sort_order: data.sort_order || 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return this.db.findMany<ExpenseCategory>('expense_categories', { user_id: userId }, { orderBy: 'sort_order', order: 'ASC' });
  }

  async createExpense(userId: string, data: Partial<Expense>): Promise<Expense> {
    const expense = await this.db.insert<Expense>('expenses', {
      user_id: userId,
      description: data.description,
      amount: data.amount,
      currency: data.currency || 'USD',
      category_id: data.category_id,
      payment_method: data.payment_method,
      merchant: data.merchant,
      expense_date: data.expense_date || new Date(),
      receipt_url: data.receipt_url,
      status: data.status || 'pending',
      is_recurring: data.is_recurring || false,
      is_tax_deductible: data.is_tax_deductible || false,
      notes: data.notes,
      tags: data.tags || [],
      metadata: data.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`Expense created: ${expense.id} for user ${userId}`);
    return expense;
  }

  async getExpenses(userId: string, options: QueryOptions & {
    category_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ items: Expense[]; total: number; summary: { total_amount: number; count: number } }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'expense_date';
    const order = options.order || 'DESC';

    let whereClause = 'e.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.category_id) {
      whereClause += ` AND e.category_id = $${paramIndex}`;
      params.push(options.category_id);
      paramIndex++;
    }

    if (options.status) {
      whereClause += ` AND e.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.start_date) {
      whereClause += ` AND e.expense_date >= $${paramIndex}`;
      params.push(options.start_date);
      paramIndex++;
    }

    if (options.end_date) {
      whereClause += ` AND e.expense_date <= $${paramIndex}`;
      params.push(options.end_date);
      paramIndex++;
    }

    if (options.search) {
      whereClause += ` AND (e.description ILIKE $${paramIndex} OR e.merchant ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    // Get count and summary
    const summaryResult = await this.db.query<{ count: string; total_amount: string }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount FROM expenses e WHERE ${whereClause}`,
      params,
    );

    // Get items with category
    const result = await this.db.query<Expense>(
      `SELECT e.*, ec.name as category_name, ec.icon as category_icon, ec.color as category_color
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       WHERE ${whereClause}
       ORDER BY e."${orderBy}" ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      items: result.rows,
      total: parseInt(summaryResult.rows[0]?.count || '0', 10),
      summary: {
        total_amount: parseFloat(summaryResult.rows[0]?.total_amount || '0'),
        count: parseInt(summaryResult.rows[0]?.count || '0', 10),
      },
    };
  }

  async getExpense(userId: string, expenseId: string): Promise<Expense> {
    const expense = await this.db.findOne<Expense>('expenses', { id: expenseId, user_id: userId });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async updateExpense(userId: string, expenseId: string, data: Partial<Expense>): Promise<Expense> {
    await this.getExpense(userId, expenseId);

    const [updated] = await this.db.update<Expense>(
      'expenses',
      { id: expenseId, user_id: userId },
      { ...data, updated_at: new Date() },
    );

    return updated;
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    await this.getExpense(userId, expenseId);
    await this.db.delete('expenses', { id: expenseId, user_id: userId });
  }

  // ============================================
  // PRODUCTS/INVENTORY CRUD
  // ============================================

  async createProductCategory(userId: string, data: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.db.insert<ProductCategory>('product_categories', {
      user_id: userId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      parent_id: data.parent_id,
      sort_order: data.sort_order || 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getProductCategories(userId: string): Promise<ProductCategory[]> {
    return this.db.findMany<ProductCategory>('product_categories', { user_id: userId }, { orderBy: 'sort_order', order: 'ASC' });
  }

  async createProduct(userId: string, data: Partial<Product>): Promise<Product> {
    const product = await this.db.insert<Product>('products', {
      user_id: userId,
      name: data.name,
      description: data.description,
      sku: data.sku,
      barcode: data.barcode,
      category_id: data.category_id,
      cost_price: data.cost_price,
      selling_price: data.selling_price,
      currency: data.currency || 'USD',
      quantity: data.quantity || 0,
      min_stock_level: data.min_stock_level || 0,
      max_stock_level: data.max_stock_level,
      reorder_point: data.reorder_point,
      unit: data.unit || 'pcs',
      status: data.status || 'active',
      is_trackable: data.is_trackable !== false,
      image_url: data.image_url,
      images: data.images || [],
      supplier_id: data.supplier_id,
      location: data.location,
      tags: data.tags || [],
      custom_fields: data.custom_fields || {},
      metadata: data.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`Product created: ${product.id} for user ${userId}`);
    return product;
  }

  async getProducts(userId: string, options: QueryOptions & {
    category_id?: string;
    status?: string;
    low_stock?: boolean;
  } = {}): Promise<{ items: Product[]; total: number }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'DESC';

    let whereClause = 'p.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.category_id) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(options.category_id);
      paramIndex++;
    }

    if (options.status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.low_stock) {
      whereClause += ` AND p.quantity <= p.min_stock_level`;
    }

    if (options.search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM products p WHERE ${whereClause}`,
      params,
    );

    const result = await this.db.query<Product>(
      `SELECT p.*, pc.name as category_name
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       WHERE ${whereClause}
       ORDER BY p."${orderBy}" ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      items: result.rows,
      total: parseInt(countResult.rows[0]?.count || '0', 10),
    };
  }

  async getProduct(userId: string, productId: string): Promise<Product> {
    const product = await this.db.findOne<Product>('products', { id: productId, user_id: userId });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(userId: string, productId: string, data: Partial<Product>): Promise<Product> {
    await this.getProduct(userId, productId);

    const [updated] = await this.db.update<Product>(
      'products',
      { id: productId, user_id: userId },
      { ...data, updated_at: new Date() },
    );

    return updated;
  }

  async deleteProduct(userId: string, productId: string): Promise<void> {
    await this.getProduct(userId, productId);
    await this.db.delete('products', { id: productId, user_id: userId });
  }

  async adjustInventory(userId: string, productId: string, data: {
    type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damage' | 'expired';
    quantity: number;
    unit_price?: number;
    reference?: string;
    notes?: string;
  }): Promise<Product> {
    const product = await this.getProduct(userId, productId);

    const previousQuantity = product.quantity;
    let newQuantity: number;

    // Calculate new quantity based on transaction type
    if (['purchase', 'return'].includes(data.type)) {
      newQuantity = previousQuantity + Math.abs(data.quantity);
    } else if (['sale', 'damage', 'expired'].includes(data.type)) {
      newQuantity = previousQuantity - Math.abs(data.quantity);
    } else {
      // adjustment or transfer
      newQuantity = previousQuantity + data.quantity;
    }

    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // Record the transaction
    await this.db.insert('inventory_transactions', {
      user_id: userId,
      product_id: productId,
      type: data.type,
      quantity: data.quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      unit_price: data.unit_price,
      total_amount: data.unit_price ? data.unit_price * Math.abs(data.quantity) : null,
      reference: data.reference,
      notes: data.notes,
      transaction_date: new Date(),
      created_at: new Date(),
    });

    // Update product quantity
    const status = newQuantity === 0 ? 'out_of_stock' : product.status === 'out_of_stock' ? 'active' : product.status;

    const [updated] = await this.db.update<Product>(
      'products',
      { id: productId, user_id: userId },
      { quantity: newQuantity, status, updated_at: new Date() },
    );

    return updated;
  }

  // ============================================
  // INVOICES CRUD
  // ============================================

  async createInvoice(userId: string, data: Partial<Invoice> & { items?: Partial<InvoiceItem>[] }): Promise<Invoice> {
    // Generate invoice number
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM invoices WHERE user_id = $1`,
      [userId],
    );
    const count = parseInt(countResult.rows[0]?.count || '0', 10);
    const invoiceNumber = data.invoice_number || `INV-${String(count + 1).padStart(5, '0')}`;

    // Calculate totals from items
    let subtotal = 0;
    if (data.items && data.items.length > 0) {
      subtotal = data.items.reduce((sum, item) => sum + (item.amount || (item.quantity || 1) * (item.unit_price || 0)), 0);
    }

    const taxAmount = subtotal * (data.tax_rate || 0) / 100;
    const total = subtotal + taxAmount - (data.discount_amount || 0);

    const invoice = await this.db.insert<Invoice>('invoices', {
      user_id: userId,
      invoice_number: invoiceNumber,
      status: data.status || 'draft',
      customer_id: data.customer_id,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      client_address: data.client_address,
      subtotal: subtotal,
      tax_rate: data.tax_rate || 0,
      tax_amount: taxAmount,
      discount_amount: data.discount_amount || 0,
      total: total,
      amount_paid: data.amount_paid || 0,
      currency: data.currency || 'USD',
      issue_date: data.issue_date || new Date(),
      due_date: data.due_date,
      notes: data.notes,
      terms: data.terms,
      footer: data.footer,
      metadata: data.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create invoice items
    if (data.items && data.items.length > 0) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        await this.db.insert('invoice_items', {
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price,
          amount: item.amount || (item.quantity || 1) * (item.unit_price || 0),
          product_id: item.product_id,
          sort_order: i,
          created_at: new Date(),
        });
      }
    }

    this.logger.log(`Invoice created: ${invoice.id} (${invoiceNumber}) for user ${userId}`);
    return this.getInvoice(userId, invoice.id);
  }

  async getInvoices(userId: string, options: QueryOptions & {
    status?: string;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ items: Invoice[]; total: number; summary: { total_amount: number; paid_amount: number; outstanding: number } }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'DESC';

    let whereClause = 'i.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.status) {
      whereClause += ` AND i.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.customer_id) {
      whereClause += ` AND i.customer_id = $${paramIndex}`;
      params.push(options.customer_id);
      paramIndex++;
    }

    if (options.start_date) {
      whereClause += ` AND i.issue_date >= $${paramIndex}`;
      params.push(options.start_date);
      paramIndex++;
    }

    if (options.end_date) {
      whereClause += ` AND i.issue_date <= $${paramIndex}`;
      params.push(options.end_date);
      paramIndex++;
    }

    if (options.search) {
      whereClause += ` AND (i.invoice_number ILIKE $${paramIndex} OR i.client_name ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    // Get summary
    const summaryResult = await this.db.query<{ count: string; total_amount: string; paid_amount: string }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_amount, COALESCE(SUM(amount_paid), 0) as paid_amount FROM invoices i WHERE ${whereClause}`,
      params,
    );

    // Get items with customer
    const result = await this.db.query<Invoice>(
      `SELECT i.*, c.name as customer_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE ${whereClause}
       ORDER BY i."${orderBy}" ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const totalAmount = parseFloat(summaryResult.rows[0]?.total_amount || '0');
    const paidAmount = parseFloat(summaryResult.rows[0]?.paid_amount || '0');

    return {
      items: result.rows,
      total: parseInt(summaryResult.rows[0]?.count || '0', 10),
      summary: {
        total_amount: totalAmount,
        paid_amount: paidAmount,
        outstanding: totalAmount - paidAmount,
      },
    };
  }

  async getInvoice(userId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await this.db.findOne<Invoice>('invoices', { id: invoiceId, user_id: userId });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Get invoice items
    const itemsResult = await this.db.query<InvoiceItem>(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order`,
      [invoiceId],
    );
    invoice.items = itemsResult.rows;

    // Get customer if linked
    if (invoice.customer_id) {
      invoice.customer = await this.db.findOne<Customer>('customers', { id: invoice.customer_id });
    }

    return invoice;
  }

  async updateInvoice(userId: string, invoiceId: string, data: Partial<Invoice> & { items?: Partial<InvoiceItem>[] }): Promise<Invoice> {
    await this.getInvoice(userId, invoiceId);

    // Recalculate totals if items provided
    if (data.items) {
      let subtotal = data.items.reduce((sum, item) => sum + (item.amount || (item.quantity || 1) * (item.unit_price || 0)), 0);
      const taxRate = data.tax_rate !== undefined ? data.tax_rate : 0;
      const taxAmount = subtotal * taxRate / 100;
      const discountAmount = data.discount_amount || 0;
      const total = subtotal + taxAmount - discountAmount;

      data.subtotal = subtotal;
      data.tax_amount = taxAmount;
      data.total = total;

      // Delete existing items and recreate
      await this.db.delete('invoice_items', { invoice_id: invoiceId });

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        await this.db.insert('invoice_items', {
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price,
          amount: item.amount || (item.quantity || 1) * (item.unit_price || 0),
          product_id: item.product_id,
          sort_order: i,
          created_at: new Date(),
        });
      }

      delete data.items;
    }

    const [updated] = await this.db.update<Invoice>(
      'invoices',
      { id: invoiceId, user_id: userId },
      { ...data, updated_at: new Date() },
    );

    return this.getInvoice(userId, invoiceId);
  }

  async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    await this.getInvoice(userId, invoiceId);
    // Items will cascade delete
    await this.db.delete('invoices', { id: invoiceId, user_id: userId });
  }

  async recordInvoicePayment(userId: string, invoiceId: string, data: {
    amount: number;
    payment_method?: string;
    payment_date?: Date;
    reference?: string;
    notes?: string;
  }): Promise<Invoice> {
    const invoice = await this.getInvoice(userId, invoiceId);

    // Record payment
    await this.db.insert('invoice_payments', {
      invoice_id: invoiceId,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_date: data.payment_date || new Date(),
      reference: data.reference,
      notes: data.notes,
      created_at: new Date(),
    });

    // Update invoice
    const newAmountPaid = (invoice.amount_paid || 0) + data.amount;
    const status = newAmountPaid >= invoice.total ? 'paid' : invoice.status;
    const paidDate = status === 'paid' ? new Date() : invoice.paid_date;

    await this.db.update(
      'invoices',
      { id: invoiceId, user_id: userId },
      { amount_paid: newAmountPaid, status, paid_date: paidDate, updated_at: new Date() },
    );

    return this.getInvoice(userId, invoiceId);
  }

  // ============================================
  // DASHBOARD / ANALYTICS
  // ============================================

  async getDashboardStats(userId: string): Promise<{
    customers: { total: number; new_this_month: number };
    expenses: { total_amount: number; this_month: number; by_category: any[] };
    products: { total: number; low_stock: number; out_of_stock: number; total_value: number };
    invoices: { total: number; outstanding_amount: number; overdue_count: number; paid_this_month: number };
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Customers stats
    const customerStats = await this.db.query<{ total: string; new_this_month: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $2) as new_this_month
       FROM customers WHERE user_id = $1`,
      [userId, startOfMonth],
    );

    // Expenses stats
    const expenseStats = await this.db.query<{ total_amount: string; this_month: string }>(
      `SELECT
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount) FILTER (WHERE expense_date >= $2), 0) as this_month
       FROM expenses WHERE user_id = $1`,
      [userId, startOfMonth],
    );

    const expensesByCategory = await this.db.query(
      `SELECT ec.name, ec.color, COALESCE(SUM(e.amount), 0) as amount
       FROM expense_categories ec
       LEFT JOIN expenses e ON ec.id = e.category_id AND e.expense_date >= $2
       WHERE ec.user_id = $1
       GROUP BY ec.id, ec.name, ec.color
       ORDER BY amount DESC
       LIMIT 5`,
      [userId, startOfMonth],
    );

    // Products stats
    const productStats = await this.db.query<{ total: string; low_stock: string; out_of_stock: string; total_value: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE quantity <= min_stock_level AND quantity > 0) as low_stock,
        COUNT(*) FILTER (WHERE quantity = 0 OR status = 'out_of_stock') as out_of_stock,
        COALESCE(SUM(quantity * COALESCE(cost_price, 0)), 0) as total_value
       FROM products WHERE user_id = $1`,
      [userId],
    );

    // Invoices stats
    const invoiceStats = await this.db.query<{ total: string; outstanding: string; overdue: string; paid_this_month: string }>(
      `SELECT
        COUNT(*) as total,
        COALESCE(SUM(total - amount_paid) FILTER (WHERE status NOT IN ('paid', 'cancelled')), 0) as outstanding,
        COUNT(*) FILTER (WHERE status = 'overdue' OR (due_date < CURRENT_DATE AND status NOT IN ('paid', 'cancelled'))) as overdue,
        COALESCE(SUM(amount_paid) FILTER (WHERE paid_date >= $2), 0) as paid_this_month
       FROM invoices WHERE user_id = $1`,
      [userId, startOfMonth],
    );

    return {
      customers: {
        total: parseInt(customerStats.rows[0]?.total || '0', 10),
        new_this_month: parseInt(customerStats.rows[0]?.new_this_month || '0', 10),
      },
      expenses: {
        total_amount: parseFloat(expenseStats.rows[0]?.total_amount || '0'),
        this_month: parseFloat(expenseStats.rows[0]?.this_month || '0'),
        by_category: expensesByCategory.rows,
      },
      products: {
        total: parseInt(productStats.rows[0]?.total || '0', 10),
        low_stock: parseInt(productStats.rows[0]?.low_stock || '0', 10),
        out_of_stock: parseInt(productStats.rows[0]?.out_of_stock || '0', 10),
        total_value: parseFloat(productStats.rows[0]?.total_value || '0'),
      },
      invoices: {
        total: parseInt(invoiceStats.rows[0]?.total || '0', 10),
        outstanding_amount: parseFloat(invoiceStats.rows[0]?.outstanding || '0'),
        overdue_count: parseInt(invoiceStats.rows[0]?.overdue || '0', 10),
        paid_this_month: parseFloat(invoiceStats.rows[0]?.paid_this_month || '0'),
      },
    };
  }
}
