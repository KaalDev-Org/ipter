import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';
import ZuelligLogo from '../components/ui/zuellig-logo';
import ApiTest from '../components/ApiTest';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login useEffect - loading:', loading, 'isAuthenticated:', isAuthenticated);
    if (!loading && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/user-management';
      console.log('Redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling login function...');
      await login(data);
      console.log('Login function completed successfully');
      // The useEffect will handle the redirect when isAuthenticated becomes true
    } catch (err: any) {
      console.error('Login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (!err.response) {
        // Network error or CORS issue
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 8080.';
        } else if (err.message?.includes('CORS')) {
          errorMessage = 'CORS error. Please check server configuration.';
        } else {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      } else if (err.response.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (err.response.status === 404) {
        errorMessage = 'Backend server not found. Please ensure the backend is running on port 8080.';
      } else if (err.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.response?.data?.message || err.response?.data?.error || errorMessage;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-z-ivory to-z-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-z-ivory via-z-light-green to-z-pale-green flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-z-sky/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-z-pale-green/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-z-light-green/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm">
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 pb-6 pt-6 px-6 bg-gradient-to-r from-z-sky/10 to-z-pale-green/10">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <ZuelligLogo className="text-slate-900" width={80} height={24} />
              </div>
              <CardTitle className="text-2xl font-header text-slate-900 tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Sign in to access your IPTER account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* API Test Component - Remove this after testing */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    {...register('username')}
                    className={`pl-10 h-11 ${
                      errors.username ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`pl-10 pr-10 h-11 ${
                      errors.password ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs">!</span>
                  </div>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-z-sky to-z-pale-green hover:from-z-sky/90 hover:to-z-pale-green/90 text-slate-900 font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Info Message */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Need access? Contact your administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 IPTER. Powered by Zuellig Pharma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
