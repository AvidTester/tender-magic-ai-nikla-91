
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/services/api';

const Login = () => {
  const { isAuthenticated, user, login } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get redirect URL from location state or default to '/'
  const from = location.state?.from?.pathname || '/';

  // If already logged in, redirect to appropriate page
  if (isAuthenticated && user) {
    return <Navigate to={from} />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDemoLogin = async (role: 'admin' | 'vendor' | 'evaluator') => {
    let demoEmail = '';
    
    switch (role) {
      case 'admin':
        demoEmail = 'admin@example.com';
        break;
      case 'vendor':
        demoEmail = 'vendor@example.com';
        break;
      case 'evaluator':
        demoEmail = 'evaluator1@example.com';
        break;
    }
    
    if (demoEmail) {
      setEmail(demoEmail);
      setPassword('password123');
      await login(demoEmail, 'password123');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Smart Procurement</h1>
          <p className="text-slate-500 mt-2">Login to manage procurement activities</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the procurement system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="your-email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Quick demo login as:</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>Admin</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('vendor')}>Vendor</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('evaluator')}>Evaluator</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Password for demo accounts: password123
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
