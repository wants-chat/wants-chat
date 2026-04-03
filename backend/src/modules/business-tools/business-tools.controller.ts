import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessToolsService } from './business-tools.service';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessToolsController {
  constructor(private readonly businessToolsService: BusinessToolsService) {}

  // ============================================
  // DASHBOARD
  // ============================================

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getDashboardStats(userId);
  }

  // ============================================
  // CUSTOMERS
  // ============================================

  @Post('customers')
  async createCustomer(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const customer = await this.businessToolsService.createCustomer(userId, body);
    return { success: true, data: customer };
  }

  @Get('customers')
  async getCustomers(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getCustomers(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
      type,
      status,
      orderBy,
      order,
    });
  }

  @Get('customers/:id')
  async getCustomer(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getCustomer(userId, id);
  }

  @Put('customers/:id')
  async updateCustomer(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const customer = await this.businessToolsService.updateCustomer(userId, id, body);
    return { success: true, data: customer };
  }

  @Delete('customers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomer(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    await this.businessToolsService.deleteCustomer(userId, id);
  }

  // ============================================
  // EXPENSE CATEGORIES
  // ============================================

  @Post('expense-categories')
  async createExpenseCategory(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const category = await this.businessToolsService.createExpenseCategory(userId, body);
    return { success: true, data: category };
  }

  @Get('expense-categories')
  async getExpenseCategories(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getExpenseCategories(userId);
  }

  // ============================================
  // EXPENSES
  // ============================================

  @Post('expenses')
  async createExpense(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const expense = await this.businessToolsService.createExpense(userId, body);
    return { success: true, data: expense };
  }

  @Get('expenses')
  async getExpenses(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('category_id') category_id?: string,
    @Query('status') status?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getExpenses(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
      category_id,
      status,
      start_date,
      end_date,
      orderBy,
      order,
    });
  }

  @Get('expenses/:id')
  async getExpense(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getExpense(userId, id);
  }

  @Put('expenses/:id')
  async updateExpense(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const expense = await this.businessToolsService.updateExpense(userId, id, body);
    return { success: true, data: expense };
  }

  @Delete('expenses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExpense(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    await this.businessToolsService.deleteExpense(userId, id);
  }

  // ============================================
  // PRODUCT CATEGORIES
  // ============================================

  @Post('product-categories')
  async createProductCategory(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const category = await this.businessToolsService.createProductCategory(userId, body);
    return { success: true, data: category };
  }

  @Get('product-categories')
  async getProductCategories(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getProductCategories(userId);
  }

  // ============================================
  // PRODUCTS / INVENTORY
  // ============================================

  @Post('products')
  async createProduct(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const product = await this.businessToolsService.createProduct(userId, body);
    return { success: true, data: product };
  }

  @Get('products')
  async getProducts(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('category_id') category_id?: string,
    @Query('status') status?: string,
    @Query('low_stock') low_stock?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getProducts(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
      category_id,
      status,
      low_stock: low_stock === 'true',
      orderBy,
      order,
    });
  }

  @Get('products/:id')
  async getProduct(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getProduct(userId, id);
  }

  @Put('products/:id')
  async updateProduct(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const product = await this.businessToolsService.updateProduct(userId, id, body);
    return { success: true, data: product };
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    await this.businessToolsService.deleteProduct(userId, id);
  }

  @Post('products/:id/inventory')
  async adjustInventory(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const product = await this.businessToolsService.adjustInventory(userId, id, body);
    return { success: true, data: product };
  }

  // ============================================
  // INVOICES
  // ============================================

  @Post('invoices')
  async createInvoice(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const invoice = await this.businessToolsService.createInvoice(userId, body);
    return { success: true, data: invoice };
  }

  @Get('invoices')
  async getInvoices(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customer_id') customer_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getInvoices(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
      status,
      customer_id,
      start_date,
      end_date,
      orderBy,
      order,
    });
  }

  @Get('invoices/:id')
  async getInvoice(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    return this.businessToolsService.getInvoice(userId, id);
  }

  @Put('invoices/:id')
  async updateInvoice(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const invoice = await this.businessToolsService.updateInvoice(userId, id, body);
    return { success: true, data: invoice };
  }

  @Delete('invoices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvoice(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub;
    await this.businessToolsService.deleteInvoice(userId, id);
  }

  @Post('invoices/:id/payments')
  async recordPayment(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId || req.user.sub;
    const invoice = await this.businessToolsService.recordInvoicePayment(userId, id, body);
    return { success: true, data: invoice };
  }
}
