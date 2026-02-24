'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Auto sign in after signup
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
      } else {
        // Sign up successful but auto sign in failed, redirect to sign in
        router.push('/auth/signin');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = (provider: 'github' | 'google') => {
    setLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity inline-block mb-6">
            NeuroDesk
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Get Started</h1>
          <p className="text-gray-600 text-lg">Create your account and start tracking focus</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">Minimum 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 rounded-xl font-bold text-white transition-all text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold">Or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignUp('github')}
              disabled={loading}
              className="py-3 bg-gray-900 hover:bg-black disabled:bg-gray-400 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading}
              className="py-3 bg-white hover:bg-gray-50 disabled:bg-gray-200 border-2 border-gray-300 rounded-xl font-bold text-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <span>Google</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center text-sm text-gray-600 pt-4">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-bold transition-colors underline decoration-dotted">
              Sign in now &rarr;
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