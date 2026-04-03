/**
 * Signup Page Generator
 *
 * Generates a React signup page that allows users to create a new account.
 * Optionally fetches app configuration for branding and settings.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateSignupPage(resolved?: ResolvedComponent): string {
  const dataSource = resolved?.dataSource || 'config';

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
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
    if (!dataSource || dataSource.trim() === '') return 'config';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'config';
  };

  const dataName = getDataPath();

  // Get API route for config fetching (optional)
  const getApiRoute = () => {
    if (resolved?.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/config/auth';
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'config';

  return `import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';

interface SignupProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Signup({ ${dataName}: propData, className }: SignupProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Optional: Fetch app configuration (branding, terms URL, etc.)
  const { data: fetchedData, isLoading: configLoading } = useQuery({
    queryKey: ['${entity}', 'auth-config'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response || {});
      } catch (err) {
        // Config fetch is optional, fail silently
        console.log('Auth config not available, using defaults');
        return {};
      }
    },
    enabled: !propData,
    retry: false,
  });

  const ${dataName} = propData || fetchedData || {};

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const response = await api.post<any>('/auth/register', data, {
        requireAuth: false,
      });
      return response;
    },
    onSuccess: (response) => {
      console.log('Signup response:', response);
      if (response?.success || response?.data?.success) {
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      } else {
        toast.error(response?.message || 'Signup failed');
      }
    },
    onError: (error: any) => {
      console.error('Signup error:', error);
      toast.error(error?.message || 'Signup failed');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    signupMutation.mutate({ email, password, name });
  };

  // Show loading while fetching config (optional, but brief)
  if (configLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {${dataName}?.signupTitle || 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {${dataName}?.signupDescription || 'Enter your information to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{' '}
                <Link
                  to={${dataName}?.termsUrl || '/terms'}
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to={${dataName}?.privacyUrl || '/privacy'}
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>

            {/* Social signup options (if configured) */}
            {${dataName}?.enableSocialAuth && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" disabled>
                    Google
                  </Button>
                  <Button variant="outline" type="button" disabled>
                    GitHub
                  </Button>
                </div>
              </>
            )}

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`;
}
