/**
 * Reset Password Page Generator
 *
 * Generates a React reset password page that validates the token from URL
 * and allows users to set a new password.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateResetPasswordPage(resolved?: ResolvedComponent): string {
  const dataSource = resolved?.dataSource || 'token';

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
    if (!dataSource || dataSource.trim() === '') return 'tokenData';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'tokenData';
  };

  const dataName = getDataPath();

  // Get API route for token validation
  const getApiRoute = () => {
    if (resolved?.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/auth/validate-reset-token';
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'token';

  return `import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface ResetPasswordProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ResetPassword({ ${dataName}: propData, className }: ResetPasswordProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate reset token using useQuery
  const { data: fetchedData, isLoading: tokenLoading, isError: tokenError } = useQuery({
    queryKey: ['${entity}', 'validate', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invalid reset link - no token provided');
      }

      try {
        const response = await api.post<any>('${apiRoute}', { token }, {
          requireAuth: false,
        });

        if (response?.success || response?.data?.success || response?.valid) {
          return {
            valid: true,
            email: response?.email || response?.data?.email || '',
            message: response?.message || response?.data?.message || 'Token is valid',
          };
        } else {
          throw new Error(response?.message || response?.data?.message || 'Invalid or expired token');
        }
      } catch (err: any) {
        // If validation endpoint doesn't exist, assume token is valid and let reset handle validation
        if (err?.response?.status === 404) {
          return { valid: true, email: '', message: 'Token will be validated on submit' };
        }
        throw err;
      }
    },
    enabled: !!token && !propData,
    retry: false,
  });

  const ${dataName} = propData || fetchedData || {};

  // Password reset mutation
  const resetMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await api.post<any>('/auth/reset-password', {
        token,
        newPassword: data.password,
      }, {
        requireAuth: false,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response?.success || response?.data?.success) {
        toast.success('Password reset successful!');
        setResetSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error(response?.message || 'Password reset failed');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Password reset failed');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    resetMutation.mutate({ password });
  };

  // No token provided
  if (!token && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Please request a new password reset link.
            </p>
            <div className="space-y-2">
              <Link to="/forgot-password">
                <Button className="w-full">Request new reset link</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state while validating token
  if (tokenLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Validating Link</CardTitle>
            <CardDescription>
              Please wait while we verify your reset link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Token validation failed
  if (tokenError && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
            <CardDescription>
              This password reset link has expired or is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Password reset links are valid for 24 hours.
              Please request a new link to reset your password.
            </p>
            <div className="space-y-2">
              <Link to="/forgot-password">
                <Button className="w-full">Request new reset link</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset!</CardTitle>
            <CardDescription>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting to login...</span>
              </div>
            </div>
            <Link to="/login">
              <Button className="w-full">Continue to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
            {${dataName}?.email && (
              <span className="block mt-1">for <strong>{${dataName}.email}</strong></span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset password
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`;
}
