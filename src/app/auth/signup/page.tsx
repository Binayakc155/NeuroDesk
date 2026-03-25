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

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/dashboard',
      });
    } catch {
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
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12 text-slate-100 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(6, 17, 32, 0.42) 0%, rgba(4, 12, 24, 0.48) 100%), url('/dashboard-neural-bg.svg')`,
        backgroundSize: 'auto, cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#061120'
      }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block mb-6 bg-gradient-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-3xl font-bold text-transparent"
          >
            NeuroDesk
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">Get Started</h1>
          <p className="text-slate-300 text-lg">
            Create your account and start tracking focus
          </p>
        </div>

        {/* Glass Form Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-3xl p-10 shadow-lg space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <p className="text-rose-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-lg focus:border-[#2bc7b7] focus:ring-2 focus:ring-[#2bc7b7]/20 outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-lg focus:border-[#2bc7b7] focus:ring-2 focus:ring-[#2bc7b7]/20 outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-lg focus:border-[#2bc7b7] focus:ring-2 focus:ring-[#2bc7b7]/20 outline-none"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-lg focus:border-[#2bc7b7] focus:ring-2 focus:ring-[#2bc7b7]/20 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#3b82f6] py-4 font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">Or sign up with</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthSignUp('github')}
              className="rounded-xl border border-white/20 bg-white/5 py-3 hover:bg-white/10 transition"
            >
              GitHub
            </button>
            <button
              onClick={() => handleOAuthSignUp('google')}
              className="rounded-xl border border-white/20 bg-white/5 py-3 hover:bg-white/10 transition"
            >
              Google
            </button>
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#2dd4bf] font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-400 hover:text-[#2dd4bf]">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}