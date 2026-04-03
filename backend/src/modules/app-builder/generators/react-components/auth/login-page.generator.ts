/**
 * Login Page Generator
 *
 * Generates a React login page that allows users to sign in.
 * Optionally fetches app configuration for branding and settings.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateLoginPage(resolved?: ResolvedComponent): string {
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
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Login({ ${dataName}: propData, className }: LoginProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Optional: Fetch app configuration (branding, social auth options, etc.)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // AuthContext's login handles the API call internally
      await login(email, password);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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

  // Get remembered email if available
  const rememberedEmail = typeof window !== 'undefined' ? localStorage.getItem('remember_email') || '' : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {${dataName}?.loginTitle || 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center">
            {${dataName}?.loginDescription || 'Enter your email and password to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  defaultValue={rememberedEmail}
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
                  className="pl-10 pr-10"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>

            {/* Social login options (if configured) */}
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
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`;
}
