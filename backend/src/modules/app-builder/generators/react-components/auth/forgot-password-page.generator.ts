/**
 * Forgot Password Page Generator
 *
 * Generates a React forgot password page that allows users to request a password reset link.
 * This is primarily a form page but can optionally fetch app configuration.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateForgotPasswordPage(resolved?: ResolvedComponent): string {
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

  // Get API route for data fetching (optional config)
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
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ForgotPassword({ ${dataName}: propData, className }: ForgotPasswordProps) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  // Optional: Fetch app configuration (branding, etc.)
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

  // Password reset mutation
  const resetMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await api.post<any>('/auth/forgot-password', { email: emailAddress }, {
        requireAuth: false,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response?.success || response?.data?.success) {
        toast.success('Password reset email sent!');
        setSent(true);
      } else {
        toast.error(response?.message || 'Failed to send reset email');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send reset email');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);
    resetMutation.mutate(emailValue);
  };

  // Show loading while fetching config (optional)
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
          <CardTitle className="text-2xl font-bold">
            {sent ? 'Check your email' : 'Reset password'}
          </CardTitle>
          <CardDescription>
            {sent
              ? 'We\\'ve sent a password reset link to your email'
              : 'Enter your email address and we\\'ll send you a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
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
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
                {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className="space-y-2">
                <Link to="/login">
                  <Button className="w-full">Return to login</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Try a different email
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}`;
}
