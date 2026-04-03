import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateExpense } from '../../hooks/useServices';
import { useAuth } from '../../contexts/AuthContext';
import { financeService } from '../../services/financeService';
import { FinanceCategory } from '../../types/expense-tracker';
import { toast } from 'sonner';
import { SimpleLayout } from '../../layouts/SimpleLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  ChevronLeft, 
  Receipt,
  AttachMoney,
  Category,
  CalendarToday as Calendar,
  Description as FileText,
  Payment,
  Save,
  Check,
  LocalCafe,
  ShoppingCart,
  DirectionsCar,
  Movie,
  Phone,
  Home,
  LocalGasStation,
  Restaurant,
  School,
  LocalHospital,
  CloudUpload,
  InsertDriveFile,
  Delete,
  Upload,
  Close
} from '@mui/icons-material';

interface ExpenseForm {
  title: string;
  amount: string;
  category: string;
  categoryId: string;
  description: string;
  paymentMethod: string;
  date: string;
}

interface ReceiptFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
}

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const createExpenseMutation = useCreateExpense();
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [loadingExpenseData, setLoadingExpenseData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [formData, setFormData] = useState<ExpenseForm>({
    title: '',
    amount: '',
    category: '',
    categoryId: '',
    description: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Partial<ExpenseForm>>({});

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'Food & Dining': <Restaurant className="h-5 w-5" />,
      'Food & Drink': <LocalCafe className="h-5 w-5" />,
      'Shopping': <ShoppingCart className="h-5 w-5" />,
      'Transportation': <DirectionsCar className="h-5 w-5" />,
      'Entertainment': <Movie className="h-5 w-5" />,
      'Utilities': <Phone className="h-5 w-5" />,
      'Housing': <Home className="h-5 w-5" />,
      'Fuel': <LocalGasStation className="h-5 w-5" />,
      'Education': <School className="h-5 w-5" />,
      'Healthcare': <LocalHospital className="h-5 w-5" />,
      'Other': <Category className="h-5 w-5" />
    };
    return iconMap[categoryName] || <Category className="h-5 w-5" />;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if we're in edit mode
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditExpenseId(editId);
    }

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await financeService.getSpendingCategories();

        if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else if (fetchedCategories && typeof fetchedCategories === 'object' && 'data' in fetchedCategories) {
          // Handle case where response is wrapped in data property
          const responseWithData = fetchedCategories as { data: FinanceCategory[] };
          setCategories(responseWithData.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('🔥 Categories API failed:', error);
        toast.error('Failed to load categories. You can still create expenses without categories.');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate, searchParams]);

  // Fetch expense data when in edit mode
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!isEditMode || !editExpenseId) return;

      try {
        setLoadingExpenseData(true);
        const expenseData = await financeService.getTransactionById(editExpenseId);
        
        // Convert date from ISO format to YYYY-MM-DD
        const transactionDate = expenseData.transaction_date 
          ? new Date(expenseData.transaction_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Pre-fill form with fetched data
        setFormData({
          title: expenseData.title || '',
          amount: expenseData.amount?.toString() || '',
          category: expenseData.category?.name || '',
          categoryId: expenseData.category_id || '',
          description: expenseData.description || '',
          paymentMethod: (expenseData.payment_method || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          date: transactionDate
        });
      } catch (error) {
        setApiError('Failed to load expense data for editing');
      } finally {
        setLoadingExpenseData(false);
      }
    };

    fetchExpenseData();
  }, [isEditMode, editExpenseId]);

  const handleInputChange = (field: keyof ExpenseForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ExpenseForm> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    // Only require category if categories are available
    if (categories.length > 0 && (!formData.categoryId || !formData.category)) {
      newErrors.category = 'Category is required';
    } else if (formData.categoryId) {
      // Validate UUID format only if category is provided
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.categoryId)) {
        newErrors.category = 'Invalid category selected';
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clear any previous API error
    setApiError(null);

    const expenseData: any = {
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      payment_method: formData.paymentMethod.toLowerCase().replace(/ /g, '_'),
      transaction_date: formData.date,
      transaction_type: 'expense',
      currency: 'USD'
    };

    // Only include category_id if a valid category is selected
    if (formData.categoryId && formData.categoryId.trim()) {
      expenseData.category_id = formData.categoryId;
    }


    try {
      setIsSubmitting(true);
      
      if (isEditMode && editExpenseId) {
        // Update existing expense
        await financeService.updateTransaction(editExpenseId, expenseData);
      } else {
        // Create new expense
        await createExpenseMutation.mutate(expenseData);
      }
      
      toast.success(`Expense ${isEditMode ? 'updated' : 'created'} successfully!`);

      // Reset form if creating new expense
      if (!isEditMode) {
        setFormData({
          title: '',
          amount: '',
          category: '',
          categoryId: '',
          description: '',
          paymentMethod: '',
          date: new Date().toISOString().split('T')[0]
        });
      }

      // Navigate back
      navigate('/expense-tracker');
    } catch (error: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} expense:`, error);
      const errorMessage = error.message || `Failed to ${isEditMode ? 'update' : 'create'} expense. Please try again.`;
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/expense-tracker');
  };

  const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Mobile Payment', label: 'Mobile Payment' },
    { value: 'Check', label: 'Check' }
  ];

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const newReceipts: ReceiptFile[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error(`File ${file.name} is not a supported format.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newReceipts.push({
          id: Date.now() + Math.random().toString(),
          file: file,
          preview: e.target?.result as string,
          uploading: false
        });

        if (newReceipts.length === Array.from(files).length) {
          setReceipts(prev => [...prev, ...newReceipts]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeReceipt = (id: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };


  const handleAddExpense = () => {
    navigate('/add-expense');
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <div className="relative z-10">
        <SimpleLayout>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Edit Expense' : 'Add New Expense'}
                  </h1>
                  <p className="text-sm text-white/60">
                    {isEditMode ? 'Update your expense details' : 'Track your spending by adding expense details'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <Close className="h-5 w-5 text-red-300 mr-3" />
                  <p className="text-sm text-red-200">{apiError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-500/20 backdrop-blur-xl border border-green-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center mr-3">
                      <Check className="h-6 w-6 text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {isEditMode ? 'Expense Updated Successfully!' : 'Expense Added Successfully!'}
                      </h3>
                      <p className="text-sm text-white/60">
                        {isEditMode ? 'Your expense has been updated. Redirecting...' : 'Your expense has been recorded. Redirecting...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Upload Section */}
            <GlassCard hover={false} className="mb-8 border-l-4 border-teal-400">
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <CloudUpload className="h-5 w-5 text-teal-400" />
                  Receipt Upload
                </h3>
                <p className="text-sm text-white/60">
                  Upload photos or scans of your receipts for record keeping
                </p>
              </div>
              <div>
                {/* Drag and Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? 'border-teal-400 bg-teal-400/10'
                      : 'border-white/30 hover:border-teal-400 hover:bg-white/5'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isDragging ? 'bg-teal-400/20' : 'bg-white/10'
                    }`}>
                      <CloudUpload className={`h-8 w-8 ${
                        isDragging ? 'text-teal-400' : 'text-white/60'
                      }`} />
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {isDragging ? 'Drop your files here' : 'Drag & Drop your receipts'}
                    </h3>

                    <p className="text-sm text-white/60 mb-4">
                      or click to browse from your device
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-white/20 text-white hover:bg-white/10"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>

                    <p className="text-xs text-white/40 mt-4">
                      Supported formats: JPG, PNG, GIF, WebP, PDF (Max 5MB per file)
                    </p>
                  </div>
                </div>

                {/* Uploaded Receipts Preview */}
                {receipts.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Uploaded Receipts ({receipts.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {receipts.map((receipt) => (
                        <div
                          key={receipt.id}
                          className="relative group border rounded-xl overflow-hidden bg-white/10 backdrop-blur-xl border-white/20 shadow-sm hover:shadow-md transition-all"
                        >
                      {/* Preview */}
                      {receipt.file.type.startsWith('image/') ? (
                        <div className="aspect-square relative">
                          <img
                            src={receipt.preview}
                            alt={receipt.file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReceipt(receipt.id)}
                              className="text-white hover:bg-red-500/20"
                            >
                              <Delete className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                          ) : (
                            <div className="aspect-square bg-white/5 flex flex-col items-center justify-center p-4">
                              <InsertDriveFile className="h-12 w-12 text-white/40 mb-2" />
                              <span className="text-sm text-white/60">PDF Document</span>
                            </div>
                          )}

                          {/* File Info */}
                          <div className="p-3 border-t border-white/10">
                            <p className="text-xs font-medium text-white truncate">
                              {receipt.file.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {formatFileSize(receipt.file.size)}
                            </p>
                          </div>

                          {/* Delete Button (for non-image files) */}
                          {!receipt.file.type.startsWith('image/') && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReceipt(receipt.id)}
                              className="absolute top-2 right-2 h-8 w-8 bg-white/10 hover:bg-red-500/20"
                            >
                              <Close className="h-4 w-4 text-white" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Form Fields */}
            <GlassCard hover={false}>
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <Receipt className="h-5 w-5 text-teal-400" />
                  Expense Details
                </h3>
                <p className="text-sm text-white/60">
                  Fill in the details of your expense
                </p>
              </div>
              <div className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-white flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-teal-400" />
                    Expense Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Grocery Shopping, Coffee at Starbucks"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`h-12 rounded-xl bg-white/5 border-white/20 text-white placeholder:text-white/40 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-400">{errors.title}</p>
                  )}
                </div>

                {/* Amount and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-white flex items-center gap-2">
                      <AttachMoney className="h-4 w-4 text-teal-400" />
                      Amount ($)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className={`h-12 rounded-xl bg-white/5 border-white/20 text-white placeholder:text-white/40 ${errors.amount ? 'border-red-500' : ''}`}
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-400">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-400" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={`h-12 rounded-xl bg-white/5 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${errors.date ? 'border-red-500' : ''}`}
                    />
                    {errors.date && (
                      <p className="text-xs text-red-400">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Category and Payment Method Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-white flex items-center gap-2">
                      <Category className="h-4 w-4 text-teal-400" />
                      Category {categories.length === 0 && !categoriesLoading && <span className="text-xs text-white/40">(Optional - categories unavailable)</span>}
                    </Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(value) => {
                        if (!categoriesLoading && value) {
                          const selectedCategory = categories.find(cat => cat.name === value);
                          if (selectedCategory) {
                            handleInputChange('category', selectedCategory.name);
                            handleInputChange('categoryId', selectedCategory.id);
                          }
                        } else {
                          handleInputChange('category', '');
                          handleInputChange('categoryId', '');
                        }
                      }}
                    >
                      <SelectTrigger className={`h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.category ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category.name)}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-red-400">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method" className="text-sm font-semibold text-white flex items-center gap-2">
                      <Payment className="h-4 w-4 text-teal-400" />
                      Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    >
                      <SelectTrigger className={`h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.paymentMethod ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-xs text-red-400">{errors.paymentMethod}</p>
                    )}
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-400" />
                    Description (Optional)
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Add any additional notes about this expense..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full min-h-[120px] p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="flex-1 h-12 border border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || loadingExpenseData}
                    className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        {isEditMode ? 'Updating...' : 'Saving...'}
                      </>
                    ) : loadingExpenseData ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Expense' : 'Save Expense'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </form>
        </SimpleLayout>
      </div>
    </div>
  );
};

export default AddExpense;