'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            NeuroDesk
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard" className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-8">
          <span>AI-Powered Focus Tracking</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          <span className="bg-linear-to-r from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
            Track Your Focus.
          </span>
          <br/>
          <span className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Build Better Habits.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Automatic distraction detection, intelligent analytics, and personalized insights to help you achieve peak productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="px-10 py-4 bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg"
          >
            {session ? 'Go to Dashboard' : 'Start Free'}
          </Link>
          <Link
            href="#features"
            className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-gray-200 text-lg"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Everything you need to stay focused
          </h2>
          <p className="text-xl text-gray-600">Powerful features designed for maximum productivity</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-linear-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Time Tracking</h3>
            <p className="text-gray-600 text-sm leading-relaxed">One-click start/stop controls with automatic session detection and real-time progress monitoring.</p>
          </div>
          <div className="group p-8 rounded-2xl bg-linear-to-br from-white to-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Distraction Detection</h3>
            <p className="text-gray-600 text-sm leading-relaxed">AI-powered detection tracks tab switches with customizable whitelists for your workflow.</p>
          </div>
          <div className="group p-8 rounded-2xl bg-linear-to-br from-white to-purple-50 border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Focus Score Analytics</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Deep insights into your productivity patterns with actionable recommendations for improvement.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-br from-blue-600 via-purple-600 to-emerald-500 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">Ready to maximize your productivity?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join thousands of focused individuals achieving more every day. Start tracking for free, no credit card required.</p>
          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="inline-flex items-center gap-3 px-12 py-5 bg-white hover:bg-gray-100 text-gray-900 font-black rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg"
          >
            <span>{session ? 'Go to Dashboard' : 'Create Free Account'}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                NeuroDesk
              </Link>
              <p className="text-sm text-gray-500 mt-2">© 2026 NeuroDesk. All rights reserved.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
