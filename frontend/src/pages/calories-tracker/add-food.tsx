import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  ChevronLeft,
  Save,
  Info as InfoIcon,
  Apple,
  Tag,
  Calculator,
  Wheat,
  Beef,
  Droplet,
  Flame,
  AlertCircle,
  Check,
  Barcode,
  Grid3x3
} from 'lucide-react';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface CustomFood {
  name: string;
  brand?: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  barcode?: string;
}

const AddFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshFoodLogs } = useCalories();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [foodData, setFoodData] = useState<CustomFood>({
    name: '',
    brand: '',
    category: 'other',
    servingSize: 100,
    servingUnit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    barcode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomFood, string>>>({});

  const categories = [
    { id: 'fruits', name: 'Fruits' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'proteins', name: 'Proteins' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'grains', name: 'Grains' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'other', name: 'Other' }
  ];

  const servingUnits = [
    { id: 'g', name: 'grams (g)' },
    { id: 'ml', name: 'milliliters (ml)' },
    { id: 'oz', name: 'ounces (oz)' },
    { id: 'cup', name: 'cup' },
    { id: 'piece', name: 'piece' },
    { id: 'serving', name: 'serving' }
  ];

  const handleInputChange = (field: keyof CustomFood, value: string | number) => {
    console.log('Updating field:', field, 'with value:', value); // Debug log
    setFoodData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated foodData:', updated); // Debug log
      return updated;
    });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomFood, string>> = {};
    
    if (!foodData.name.trim()) {
      newErrors.name = 'Food name is required';
    }
    
    if (foodData.servingSize <= 0) {
      newErrors.servingSize = 'Serving size must be greater than 0';
    }
    
    if (foodData.calories < 0) {
      newErrors.calories = 'Calories cannot be negative';
    }
    
    if (foodData.protein < 0) {
      newErrors.protein = 'Protein cannot be negative';
    }
    
    if (foodData.carbs < 0) {
      newErrors.carbs = 'Carbohydrates cannot be negative';
    }
    
    if (foodData.fat < 0) {
      newErrors.fat = 'Fat cannot be negative';
    }
    
    // Check if macros roughly match calories (4 cal/g for carbs & protein, 9 cal/g for fat)
    const calculatedCalories = (foodData.protein * 4) + (foodData.carbs * 4) + (foodData.fat * 9);
    const caloriesDifference = Math.abs(calculatedCalories - foodData.calories);
    const tolerance = foodData.calories * 0.2; // 20% tolerance
    
    if (foodData.calories > 0 && caloriesDifference > tolerance) {
      newErrors.calories = `Calories don't match macros. Expected around ${Math.round(calculatedCalories)} calories`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError('');
      
      try {
        if (isAuthenticated) {
          // Use API for authenticated users
          await caloriesApi.createCustomFood({
            name: foodData.name,
            brand: foodData.brand,
            category: foodData.category,
            calories_per_100g: Math.round(foodData.calories * (100 / foodData.servingSize)),
            protein_per_100g: Math.round(foodData.protein * (100 / foodData.servingSize) * 10) / 10,
            carbs_per_100g: Math.round(foodData.carbs * (100 / foodData.servingSize) * 10) / 10,
            fat_per_100g: Math.round(foodData.fat * (100 / foodData.servingSize) * 10) / 10,
            fiber_per_100g: foodData.fiber ? Math.round(foodData.fiber * (100 / foodData.servingSize) * 10) / 10 : undefined,
            sugar_per_100g: foodData.sugar ? Math.round(foodData.sugar * (100 / foodData.servingSize) * 10) / 10 : undefined
          });
          
          // Refresh food logs to include new custom food
          await refreshFoodLogs();
        } else {
          // Fallback to localStorage for non-authenticated users
          const customFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
          const newFood = {
            id: Date.now().toString(),
            ...foodData,
            createdAt: new Date().toISOString(),
            isCustom: true
          };
          
          customFoods.push(newFood);
          localStorage.setItem('customFoods', JSON.stringify(customFoods));
        }
        
        toast.success('Custom food created successfully!');
        navigate('/calories-tracker/food-search', { state: { customFoodCreated: true } });
      } catch (error) {
        console.error('Failed to create custom food:', error);
        setApiError('Failed to create custom food. Please try again.');
        toast.error('Failed to create custom food. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/calories-tracker/food-search');
  };

  // Calculate calories from macros
  const calculateCaloriesFromMacros = () => {
    return (foodData.protein * 4) + (foodData.carbs * 4) + (foodData.fat * 9);
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/calories-tracker/food-search')}
                className="mr-2 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Apple className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-semibold text-white">
                Add Custom Food
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/20 border border-teal-400/30">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Custom Food
          </h1>
          <p className="text-lg text-white/60">
            Add your own food items with nutritional information for easy tracking
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-emerald-400 mr-2" />
            <span className="text-emerald-300">
              Custom food created successfully! Redirecting...
            </span>
          </div>
        )}

        {apiError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Apple className="h-5 w-5 text-teal-400" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter the name and category of your custom food
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-white/80">
                    Food Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Apple className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="name"
                      placeholder="e.g., Homemade Granola"
                      value={foodData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-400 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brand" className="text-sm font-semibold text-white/80">
                    Brand (Optional)
                  </Label>
                  <div className="relative mt-1">
                    <Tag className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="brand"
                      placeholder="e.g., Your Kitchen"
                      value={foodData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-white/80">
                    Category
                  </Label>
                  <div className="relative mt-1">
                    <Grid3x3 className="absolute left-4 top-3.5 h-5 w-5 text-white/40 z-10 pointer-events-none" />
                    <select
                      id="category"
                      value={foodData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/20 bg-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-teal-800/90 text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="barcode" className="text-sm font-semibold text-white/80">
                    Barcode (Optional)
                  </Label>
                  <div className="relative mt-1">
                    <Barcode className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="barcode"
                      placeholder="e.g., 1234567890123"
                      value={foodData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serving Information */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calculator className="h-5 w-5 text-teal-400" />
              Serving Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Define the serving size for nutritional calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="servingSize" className="text-sm font-semibold text-white/80">
                  Serving Size <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="servingSize"
                  type="number"
                  placeholder="100"
                  value={foodData.servingSize}
                  onChange={(e) => handleInputChange('servingSize', parseFloat(e.target.value) || 0)}
                  className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.servingSize ? 'border-red-500' : ''}`}
                />
                {errors.servingSize && (
                  <p className="text-sm text-red-400 mt-1">{errors.servingSize}</p>
                )}
              </div>

              <div>
                <Label htmlFor="servingUnit" className="text-sm font-semibold text-white/80">
                  Serving Unit
                </Label>
                <div className="relative mt-1">
                  <Calculator className="absolute left-4 top-3.5 h-5 w-5 text-white/40 z-10 pointer-events-none" />
                  <select
                    id="servingUnit"
                    value={foodData.servingUnit}
                    onChange={(e) => handleInputChange('servingUnit', e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/20 bg-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    {servingUnits.map(unit => (
                      <option key={unit.id} value={unit.id} className="bg-teal-800/90 text-white">
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Information */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Flame className="h-5 w-5 text-teal-400" />
              Nutritional Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter the nutritional values per serving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calories */}
            <div>
              <Label htmlFor="calories" className="text-sm font-semibold text-white/80">
                Calories <span className="text-red-400">*</span>
              </Label>
              <div className="relative mt-1">
                <Flame className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                <Input
                  id="calories"
                  type="number"
                  placeholder="0"
                  value={foodData.calories}
                  onChange={(e) => handleInputChange('calories', parseFloat(e.target.value) || 0)}
                  className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.calories ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.calories && (
                <p className="text-sm text-red-400 mt-1">{errors.calories}</p>
              )}
              <p className="text-xs text-white/50 mt-1">
                Calculated from macros: {calculateCaloriesFromMacros()} calories
              </p>
            </div>

            {/* Macronutrients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="protein" className="text-sm font-semibold text-white/80">
                  Protein (g) <span className="text-red-400">*</span>
                </Label>
                <div className="relative mt-1">
                  <Beef className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={foodData.protein}
                    onChange={(e) => handleInputChange('protein', parseFloat(e.target.value) || 0)}
                    className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.protein ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.protein && (
                  <p className="text-sm text-red-400 mt-1">{errors.protein}</p>
                )}
              </div>

              <div>
                <Label htmlFor="carbs" className="text-sm font-semibold text-white/80">
                  Carbohydrates (g) <span className="text-red-400">*</span>
                </Label>
                <div className="relative mt-1">
                  <Wheat className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={foodData.carbs}
                    onChange={(e) => handleInputChange('carbs', parseFloat(e.target.value) || 0)}
                    className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.carbs ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.carbs && (
                  <p className="text-sm text-red-400 mt-1">{errors.carbs}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fat" className="text-sm font-semibold text-white/80">
                  Fat (g) <span className="text-red-400">*</span>
                </Label>
                <div className="relative mt-1">
                  <Droplet className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={foodData.fat}
                    onChange={(e) => handleInputChange('fat', parseFloat(e.target.value) || 0)}
                    className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.fat ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.fat && (
                  <p className="text-sm text-red-400 mt-1">{errors.fat}</p>
                )}
              </div>
            </div>

            {/* Additional Nutrients */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white/80">
                Additional Nutrients (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="fiber" className="text-sm font-medium text-white/60">
                    Fiber (g)
                  </Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={foodData.fiber}
                    onChange={(e) => handleInputChange('fiber', parseFloat(e.target.value) || 0)}
                    className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="sugar" className="text-sm font-medium text-white/60">
                    Sugar (g)
                  </Label>
                  <Input
                    id="sugar"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={foodData.sugar}
                    onChange={(e) => handleInputChange('sugar', parseFloat(e.target.value) || 0)}
                    className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="sodium" className="text-sm font-medium text-white/60">
                    Sodium (mg)
                  </Label>
                  <Input
                    id="sodium"
                    type="number"
                    placeholder="0"
                    value={foodData.sodium}
                    onChange={(e) => handleInputChange('sodium', parseFloat(e.target.value) || 0)}
                    className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Macro calculation help */}
            <div className="p-4 bg-teal-500/10 border border-teal-400/30 rounded-xl">
              <div className="flex items-start gap-3">
                <InfoIcon className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">
                    <strong>Calorie Calculation Guide:</strong>
                  </p>
                  <ul className="text-xs text-white/70 mt-1 space-y-1">
                    <li>• Protein: 4 calories per gram</li>
                    <li>• Carbohydrates: 4 calories per gram</li>
                    <li>• Fat: 9 calories per gram</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <Button
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl bg-white/10 border-2 border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-8 text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Create Food
              </>
            )}
          </Button>
        </div>

        {/* Important Note */}
        <Card className="rounded-2xl border-2 border-amber-400/30 bg-amber-500/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/20">
                <InfoIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Tips for Accuracy</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Use a food scale for precise measurements</li>
                  <li>• Check nutrition labels carefully</li>
                  <li>• Include all ingredients in homemade recipes</li>
                  <li>• Your custom foods will be saved for future use</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddFoodPage;