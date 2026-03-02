'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen text-gray-100 bg-black overflow-hidden">

      {/* Animated Dark Gradient Background */}
      <div className="absolute inset-0 -z-30 bg-gradient-to-br from-black via-gray-950 to-gray-900 animate-gradientShift" />

      {/* Floating Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-floatSlow -z-20" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-floatMedium -z-20" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent"
          >
            NeuroDesk
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-indigo-400 transition"
                >
                  Sign in
                </Link>

                <Link
                  href="/auth/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center animate-fadeUp">

        <div className="inline-flex items-center px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-semibold mb-8 border border-indigo-500/20">
          AI-Powered Focus Tracking
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
          <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Master Your Focus
          </span>
          <span className="block text-white">
            Own Your Productivity
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          Smart distraction detection, intelligent analytics, and personalized insights
          designed to help you reach deep work faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            {session ? 'Go to Dashboard' : 'Start Free'}
          </Link>

          <Link
            href="#features"
            className="px-10 py-4 bg-white/5 border border-white/10 text-gray-200 font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">

        <div className="text-center mb-20 animate-fadeUp">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Everything you need to stay locked in
          </h2>
          <p className="text-xl text-gray-400">
            Built for ambitious minds who value deep work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            { title: 'Smart Time Tracking', color: 'text-indigo-400' },
            { title: 'Auto Distraction Detection', color: 'text-cyan-400' },
            { title: 'Focus Score Analytics', color: 'text-rose-400' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <h3 className={`text-xl font-bold mb-4 ${feature.color}`}>
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powerful tools and intelligent systems designed to help you improve focus and build lasting productivity habits.
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* Black CTA Section */}
      <section className="relative bg-black py-28 overflow-hidden">

        {/* Soft ambient gradient glow */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[900px] h-[400px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-white">
            Ready to unlock your peak performance?
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Join thousands building unstoppable focus habits and achieving deep work consistently.
          </p>

          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="inline-flex items-center justify-center px-12 py-5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {session ? 'Go to Dashboard' : 'Create Free Account'} →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link
              href="/"
              className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent"
            >
              NeuroDesk
            </Link>
            <p className="text-sm text-gray-400 mt-2">
              © 2026 NeuroDesk. All rights reserved.
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <Link href="#" className="text-gray-400 hover:text-indigo-400 transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-indigo-400 transition">
              Terms
            </Link>
            <Link href="#" className="text-gray-400 hover:text-indigo-400 transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Animations */}
      <style jsx global>{`

        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(15deg); }
        }
        .animate-gradientShift {
          animation: gradientShift 25s ease infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(25px); }
        }
        .animate-floatSlow {
          animation: floatSlow 16s ease-in-out infinite;
        }

        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-floatMedium {
          animation: floatMedium 14s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 1s ease forwards;
        }

      `}</style>

    </div>
  );
}