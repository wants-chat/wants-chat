import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Common mock data for write review form

export const generateWriteReviewForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'detailed' = 'inline'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    inline: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface WriteReviewFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  showRating?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function WriteReviewForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, showRating = true, onSubmit, onCancel }: WriteReviewFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '',
    recommend: '',
    photos: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const productName = ${getField('productName')};
  const productImage = ${getField('productImage')};
  const ratingLabel = ${getField('ratingLabel')};
  const reviewTitleLabel = ${getField('reviewTitleLabel')};
  const reviewTextLabel = ${getField('reviewTextLabel')};
  const recommendLabel = ${getField('recommendLabel')};
  const uploadPhotosLabel = ${getField('uploadPhotosLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const reviewPlaceholder = ${getField('reviewPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};
  const successMessage = ${getField('successMessage')};
  const characterCountLabel = ${getField('characterCountLabel')};
  const validation = ${getField('validation')};
  const reviewingProductLabel = ${getField('reviewingProductLabel')};
  const maxPhotosLabel = ${getField('maxPhotosLabel')};

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = validation.ratingRequired;
    }

    if (!formData.title.trim()) {
      newErrors.title = validation.titleRequired;
    }

    if (formData.review.length < 50) {
      newErrors.review = validation.reviewTooShort;
    } else if (formData.review.length > 1000) {
      newErrors.review = validation.reviewTooLong;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setIsSubmitting(false);
      setShowSuccess(true);
      if (onSubmit) {
        onSubmit(data);
      }
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ rating: 0, title: '', review: '', recommend: '', photos: [] });
      }, 2000);
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      console.error('Review submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    submitMutation.mutate(formData);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 p-8", className)}>
      {/* Product Info */}
      <div className="flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 mb-6">
        <img src={productImage} alt={productName} className="w-16 h-16 rounded-lg object-cover" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{reviewingProductLabel}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white">{productName}</h3>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-300">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{ratingLabel} *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleChange('rating', star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-125 active:scale-95"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-all duration-200",
                    (hoveredRating >= star || formData.rating >= star)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                      : "text-gray-300 dark:text-gray-600"
                  )}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 mb-2 block">
            {reviewTitleLabel} *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder={titlePlaceholder}
            className={cn(
              "rounded-xl border-2 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all",
              errors.title && "border-red-500 dark:border-red-500"
            )}
          />
          {errors.title && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Review */}
        <div>
          <Label htmlFor="review" className="text-gray-700 dark:text-gray-300 mb-2 block">
            {reviewTextLabel} *
          </Label>
          <Textarea
            id="review"
            value={formData.review}
            onChange={(e) => handleChange('review', e.target.value)}
            placeholder={reviewPlaceholder}
            rows={6}
            className={cn(
              "rounded-xl border-2 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all",
              errors.review && "border-red-500 dark:border-red-500"
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.review ? (
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.review}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.review.length}/1000 {characterCountLabel}
              </p>
            )}
          </div>
        </div>

        {/* Recommend */}
        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{recommendLabel}</Label>
          <RadioGroup value={formData.recommend} onValueChange={(value) => handleChange('recommend', value)}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" className="dark:border-gray-600" />
                <Label htmlFor="yes" className="text-gray-700 dark:text-gray-300 cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" className="dark:border-gray-600" />
                <Label htmlFor="no" className="text-gray-700 dark:text-gray-300 cursor-pointer">No</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Photos */}
        <div>
          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
            {uploadPhotosLabel}
          </Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={\`Upload \${index + 1}\`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {formData.photos.length < 5 && (
                <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:scale-105">
                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{maxPhotosLabel}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : submitButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl hover:scale-105 transition-all dark:border-gray-600 dark:text-gray-300"
          >
            {cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
    `,

    modal: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Upload, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface WriteReviewFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
}

export default function WriteReviewForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, isOpen = true, onClose, onSubmit }: WriteReviewFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '',
    recommend: '',
    photos: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const productName = ${getField('productName')};
  const ratingLabel = ${getField('ratingLabel')};
  const reviewTitleLabel = ${getField('reviewTitleLabel')};
  const reviewTextLabel = ${getField('reviewTextLabel')};
  const recommendLabel = ${getField('recommendLabel')};
  const uploadPhotosLabel = ${getField('uploadPhotosLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const reviewPlaceholder = ${getField('reviewPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};
  const characterCountLabel = ${getField('characterCountLabel')};
  const validation = ${getField('validation')};

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = validation.ratingRequired;
    }

    if (!formData.title.trim()) {
      newErrors.title = validation.titleRequired;
    }

    if (formData.review.length < 50) {
      newErrors.review = validation.reviewTooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setIsSubmitting(false);
      if (onSubmit) {
        onSubmit(data);
      }
      if (onClose) {
        onClose();
      }
      setFormData({ rating: 0, title: '', review: '', recommend: '', photos: [] });
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      console.error('Review submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Write a Review for {productName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{ratingLabel} *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange('rating', star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8",
                      (hoveredRating >= star || formData.rating >= star)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {reviewTitleLabel} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={titlePlaceholder}
              className={cn(
                "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.title && "border-red-500"
              )}
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Review */}
          <div>
            <Label htmlFor="review" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {reviewTextLabel} *
            </Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => handleChange('review', e.target.value)}
              placeholder={reviewPlaceholder}
              rows={5}
              className={cn(
                "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.review && "border-red-500"
              )}
            />
            <div className="flex justify-between mt-1">
              {errors.review ? (
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.review}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.review.length}/1000 {characterCountLabel}
                </p>
              )}
            </div>
          </div>

          {/* Recommend */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{recommendLabel}</Label>
            <RadioGroup value={formData.recommend} onValueChange={(value) => handleChange('recommend', value)}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="text-gray-700 dark:text-gray-300 cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="text-gray-700 dark:text-gray-300 cursor-pointer">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Photos */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{uploadPhotosLabel}</Label>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={\`Upload \${index + 1}\`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {formData.photos.length < 5 && (
                <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : submitButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
            >
              {cancelButton}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Upload, X, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface WriteReviewFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  showRating?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function WriteReviewForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, showRating = true, onSubmit, onCancel }: WriteReviewFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '',
    recommend: '',
    photos: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const productName = ${getField('productName')};
  const productImage = ${getField('productImage')};
  const ratingLabel = ${getField('ratingLabel')};
  const reviewTitleLabel = ${getField('reviewTitleLabel')};
  const reviewTextLabel = ${getField('reviewTextLabel')};
  const recommendLabel = ${getField('recommendLabel')};
  const uploadPhotosLabel = ${getField('uploadPhotosLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const reviewPlaceholder = ${getField('reviewPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};
  const successMessage = ${getField('successMessage')};
  const characterCountLabel = ${getField('characterCountLabel')};
  const validation = ${getField('validation')};
  const ratingOptions = ${getField('ratingOptions')};
  const guidelines = ${getField('guidelines')};
  const guidelinesTitle = ${getField('guidelinesTitle')};
  const reviewingProductLabel = ${getField('reviewingProductLabel')};

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = validation.ratingRequired;
    }

    if (!formData.title.trim()) {
      newErrors.title = validation.titleRequired;
    }

    if (formData.review.length < 50) {
      newErrors.review = validation.reviewTooShort;
    } else if (formData.review.length > 1000) {
      newErrors.review = validation.reviewTooLong;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setIsSubmitting(false);
      setShowSuccess(true);
      if (onSubmit) {
        onSubmit(data);
      }
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ rating: 0, title: '', review: '', recommend: '', photos: [] });
      }, 2000);
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      console.error('Review submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    submitMutation.mutate(formData);
  };

  const getRatingLabel = (rating: number): string => {
    const option = ratingOptions.find((opt: any) => opt.value === rating);
    return option ? option.label : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-5xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Write a Review</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Product Info */}
            <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{reviewingProductLabel}</p>
                <div className="flex items-center gap-4">
                  <img src={productImage} alt={productName} className="w-16 h-16 rounded-lg object-cover" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{productName}</h3>
                </div>
              </CardContent>
            </Card>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6 space-y-6">
                  {/* Rating */}
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 mb-3 block text-lg">{ratingLabel} *</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleChange('rating', star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                "w-10 h-10",
                                (hoveredRating >= star || formData.rating >= star)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      {formData.rating > 0 && (
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {getRatingLabel(formData.rating)}
                        </p>
                      )}
                    </div>
                    {errors.rating && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.rating}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 mb-2 block">
                      {reviewTitleLabel} *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder={titlePlaceholder}
                      className={cn(
                        "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                        errors.title && "border-red-500 dark:border-red-500"
                      )}
                    />
                    {errors.title && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Review */}
                  <div>
                    <Label htmlFor="review" className="text-gray-700 dark:text-gray-300 mb-2 block">
                      {reviewTextLabel} *
                    </Label>
                    <Textarea
                      id="review"
                      value={formData.review}
                      onChange={(e) => handleChange('review', e.target.value)}
                      placeholder={reviewPlaceholder}
                      rows={8}
                      className={cn(
                        "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                        errors.review && "border-red-500 dark:border-red-500"
                      )}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.review ? (
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.review}</p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formData.review.length}/1000 {characterCountLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recommend */}
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{recommendLabel}</Label>
                    <RadioGroup value={formData.recommend} onValueChange={(value) => handleChange('recommend', value)}>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" className="dark:border-gray-600" />
                          <Label htmlFor="yes" className="text-gray-700 dark:text-gray-300 cursor-pointer">Yes, I recommend this</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" className="dark:border-gray-600" />
                          <Label htmlFor="no" className="text-gray-700 dark:text-gray-300 cursor-pointer">No, I don't recommend</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Photos */}
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 mb-3 block">{uploadPhotosLabel}</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={\`Upload \${index + 1}\`}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {formData.photos.length < 5 && (
                          <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add up to 5 photos to help others
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : submitButton}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  {cancelButton}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700 sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{guidelinesTitle}</h3>
                </div>
                <ul className="space-y-3">
                  {guidelines.map((guideline: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.inline;
};
