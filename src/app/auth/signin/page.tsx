'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'github' | 'google') => {
    setLoading(true);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity inline-block mb-6">
            NeuroDesk
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to continue your focus journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-10 space-y-6 border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-semibold text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-900">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 rounded-xl font-bold text-white transition-all text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="py-3 bg-gray-900 hover:bg-black disabled:bg-gray-400 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="py-3 bg-white hover:bg-gray-50 disabled:bg-gray-200 border-2 border-gray-300 rounded-xl font-bold text-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <span>Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600 pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors underline decoration-dotted">
              Create one now &rarr;
            </Link>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 text-sm font-semibold transition-colors inline-flex items-center gap-2 hover:gap-3">
            <span>&larr;</span> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}