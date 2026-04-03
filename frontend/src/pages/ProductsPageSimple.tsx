import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const ProductsPageSimple: React.FC = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 'fitness',
      name: 'Fitness Tracker Pro',
      description: 'AI-powered workout plans and progress tracking',
      status: 'Available',
      route: '/fitness',
      icon: FitnessCenterIcon,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'health',
      name: 'Health Tracker Pro', 
      description: 'Medical records and vital signs monitoring',
      status: 'Available',
      route: '/health',
      icon: LocalHospitalIcon,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Our Products</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our complete suite of life management tools
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {products.map((product, index) => (
              <div key={product.id} className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Product Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                      <product.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {product.status}
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {product.description}
                  </p>

                  <Button 
                    onClick={() => navigate(product.route)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Explore {product.name.split(' ')[0]}
                    <ArrowForwardIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Product Details Card */}
                <div>
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Key Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span>Feature 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span>Feature 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span>Feature 3</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <Button 
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProductsPageSimple;