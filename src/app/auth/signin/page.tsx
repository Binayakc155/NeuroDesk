'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SignInForm() {
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
    <div className="dashboard-shell relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 text-slate-100">
      <div className="float-orb pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-[#5568ff]/16 blur-3xl -z-10" />
      <div className="float-orb-delay pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-[#9370ff]/12 blur-3xl -z-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-3xl font-bold text-transparent transition-opacity hover:opacity-80">
            NeuroDesk
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">Welcome Back</h1>
          <p className="text-slate-400 text-lg">Sign in to continue your focus journey</p>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-200">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#8fd5ff] transition-colors hover:text-[#b4e4ff]">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-[#6b7dff] focus:outline-none focus:ring-2 focus:ring-[#6b7dff]/20"
                placeholder="••••••••"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-[#6b7dff] to-[#8f72ff] py-4 text-center font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-[#7e8dff] hover:to-[#a082ff] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#08101f]/70 px-4 font-semibold text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-white/12 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-white/12 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span>Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-slate-400 pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-bold text-[#8fd5ff] underline decoration-dotted transition-colors hover:text-[#b4e4ff]">
              Create one now &rarr;
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

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="dashboard-shell relative min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}