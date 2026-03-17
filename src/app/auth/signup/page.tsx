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
    <div className="dashboard-shell relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 text-slate-100">
      <div className="float-orb pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-[#5568ff]/16 blur-3xl -z-10" />
      <div className="float-orb-delay pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-[#9370ff]/12 blur-3xl -z-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-3xl font-bold text-transparent transition-opacity hover:opacity-80">
            NeuroDesk
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">Get Started</h1>
          <p className="text-slate-400 text-lg">Create your account and start tracking focus</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/10 bg-[#08101f]/70 p-10 shadow-[0_18px_46px_rgba(0,0,0,0.35)] backdrop-blur-xl space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <p className="text-rose-400 font-semibold text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="••••••••"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Minimum 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="••••••••"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-linear-to-r from-[#6b7dff] to-[#8f72ff] py-4 text-center font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-[#7e8dff] hover:to-[#a082ff] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#08101f]/70 px-4 font-semibold text-slate-400">Or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignUp('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-white/12 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-white/12 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span>Google</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center text-sm text-slate-400 pt-4">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-bold text-[#8fd5ff] underline decoration-dotted transition-colors hover:text-[#b4e4ff]">
              Sign in now &rarr;
            </Link>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:gap-3 hover:text-[#8fd5ff]">
            <span>&larr;</span> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}