import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

// 1. Define the validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle Social OAuth Redirect Callbacks
  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1)); // remove '#'
      const idToken = params.get('id_token');
      const state = params.get('state');

      if (idToken) {
        setIsLoading(true);
        setServerError('');
        // Clear hash from address bar for clean URL
        window.history.replaceState(null, '', window.location.pathname);

        try {
          let response;
          if (state === 'google') {
            response = await api.post('/auth/google', { idToken });
          } else if (state === 'microsoft') {
            response = await api.post('/auth/microsoft', { idToken });
          }

          if (response && response.data && response.data.data) {
            const authData = response.data.data;
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('user', JSON.stringify(authData.user));
            navigate('/dashboard');
          }
        } catch (err) {
          console.error("Social login error:", err);
          setServerError(err.response?.data?.message || "Social login failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, [navigate]);

  // 2. Initialize React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. Handle the form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      console.log('Submitting payload:', data);
      
      // Real API CALL
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = '946927389105-5ji6kuvvtbnkvqubinabock014v26gsl.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const scope = encodeURIComponent('openid email profile');
    const state = 'google';
    const nonce = Math.random().toString(36).substring(2);
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&state=${state}&nonce=${nonce}`;
  };

  const handleMicrosoftLogin = () => {
    const clientId = '537f1e34-78ee-4f6e-816e-a8cea6552c56';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const scope = encodeURIComponent('openid email profile');
    const state = 'microsoft';
    const nonce = Math.random().toString(36).substring(2);
    
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&response_mode=fragment&state=${state}&nonce=${nonce}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors z-10">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-[fade-in-up_0.6s_ease-out_forwards]">
        <div className="mb-8 text-center flex flex-col items-center">
          <BrainCircuit className="w-10 h-10 text-emerald-400 mb-4" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your credentials to access your fitness hub.</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input 
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <div className="space-y-1">
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Log In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-550">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.26620007,9.76451641 C6.19875207,6.93863673 8.85468207,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.50909091 L19.9090909,3.01818182 C17.7818182,1.14545455 15.0545455,0 12,0 C7.30909091,0 3.25454545,2.69090909 1.25454545,6.60909091 L5.26620007,9.76451641 Z"
              />
              <path
                fill="#4285F4"
                d="M23.4909091,12.2727273 C23.4909091,11.4181818 23.4181818,10.6 23.2727273,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1636364,15.9818182 17.2909091,17.2727273 16,18.1272727 L19.9090909,21.1454545 C22.2,19.0363636 23.4909091,15.9454545 23.4909091,12.2727273 Z"
              />
              <path
                fill="#FBBC05"
                d="M5.26620007,14.2354836 L1.25454545,17.3909091 C3.25454545,21.3090909 7.30909091,24 12,24 C15.0545455,24 17.7818182,22.8545455 19.9090909,20.9818182 L16,17.9636364 C14.9272727,18.6909091 13.5636364,19.0909091 12,19.0909091 C8.85468207,19.0909091 6.19875207,17.0613633 5.26620007,14.2354836 Z"
              />
              <path
                fill="#34A853"
                d="M1.25454545,6.60909091 C0.454545455,8.18181818 0,9.98181818 0,11.9090909 C0,13.8363636 0.454545455,15.6363636 1.25454545,17.2090909 L5.26620007,14.0536654 C5.09090909,13.3818182 5,12.6545455 5,11.9090909 C5,11.1636364 5.09090909,10.4363636 5.26620007,9.76451641 L1.25454545,6.60909091 Z"
              />
            </svg>
            Google
          </button>
          
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23">
              <rect x="0" y="0" width="11" height="11" fill="#F25022" />
              <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
              <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
              <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
            </svg>
            Microsoft
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}