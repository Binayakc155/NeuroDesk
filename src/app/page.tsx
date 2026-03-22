'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen text-gray-100 dashboard-shell overflow-hidden">

      {/* Floating Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-125 h-125 bg-[#5568ff]/16 rounded-full blur-3xl animate-floatSlow -z-20" />
      <div className="absolute -bottom-40 -right-40 w-125 h-125 bg-[#9370ff]/12 rounded-full blur-3xl animate-floatMedium -z-20" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#050814]/70 border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-black bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-transparent"
          >
            NeuroDesk
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-linear-to-r from-[#6b7dff] to-[#8f72ff] text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-[#8fd5ff] transition"
                >
                  Sign in
                </Link>

                <Link
                  href="/auth/signup"
                  className="px-6 py-2.5 bg-linear-to-r from-[#6b7dff] to-[#8f72ff] text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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

        <div className="inline-flex items-center px-4 py-2 bg-[#5568ff]/10 text-[#8fd5ff] rounded-full text-sm font-semibold mb-8 border border-[#5568ff]/20">
          AI-Powered Focus Tracking
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
          <span className="block bg-linear-to-r from-[#8fd5ff] via-[#c4b1ff] to-[#a5d8ff] bg-clip-text text-transparent">
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
            className="px-10 py-4 bg-linear-to-r from-[#6b7dff] to-[#8f72ff] text-white font-bold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
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
      </section >

      {/* Features */}
      < section id="features" className="max-w-6xl mx-auto px-6 py-24" >

        <div className="text-center mb-20 animate-fadeUp">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-transparent">
            Everything you need to stay locked in
          </h2>
          <p className="text-xl text-gray-400">
            Built for ambitious minds who value deep work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              title: 'Smart Time Tracking',
              color: 'text-indigo-400',
              description: 'Automatically tracks your focus sessions with precision. Know exactly how much deep work you accomplish each day.'
            },
            {
              title: 'Auto Distraction Detection',
              color: 'text-cyan-400',
              description: 'Intelligent algorithms detect when you switch tabs or get distracted. Build awareness of your habits.'
            },
            {
              title: 'Focus Score Analytics',
              color: 'text-rose-400',
              description: 'Get detailed insights into your focus quality. Understand patterns and optimize your productivity.'
            },
            {
              title: 'Weekly Reports',
              color: 'text-emerald-400',
              description: 'Beautiful analytics dashboards show your progress. Track improvements over time with detailed metrics.'
            },
            {
              title: 'Whitelist Management',
              color: 'text-yellow-400',
              description: 'Customize which websites count as work vs distractions. Get smarter tracking tailored to your workflow.'
            },
            {
              title: 'Session History',
              color: 'text-purple-400',
              description: 'Access your complete focus history organized by day. Review past sessions and celebrate your wins.'
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20"
            >
              <h3 className={`text-xl font-bold mb-4 ${feature.color}`}>
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </section >

      {/* Testimonials Section 
      < section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10" >

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-transparent">
            Trusted by focused professionals
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands of developers, designers, and creators achieving deep work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Himanshu',
              role: 'Software Developer',
              text: 'NeuroDesk helped me increase my focus time by 40%. The distraction detection is incredibly accurate.',
            },
            {
              name: 'Brishen',
              role: 'Product Designer',
              text: 'Finally understand when I\'m most productive. The weekly insights have transformed my work schedule.',
            },
            {
              name: 'Sugam',
              role: 'Content Creator',
              text: 'The focus score tracking gave me the accountability I needed. My productivity doubled in 3 weeks.',
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="text-yellow-400">★</div>
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                <p className="text-gray-500 text-xs">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section >
                   */}
      {/* FAQ Section */}
      < section className="max-w-4xl mx-auto px-6 py-24 border-t border-white/10" >

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-transparent">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              question: 'How does NeuroDesk track focus sessions?',
              answer: 'NeuroDesk uses intelligent browser APIs to detect when you leave or return to the tab. Sessions are tracked client-side for your privacy.',
            },


            {
              question: 'How do I get started?',
              answer: 'Create your account and begin tracking sessions instantly. Setup takes less than a minute.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <h3 className="font-bold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section >

      {/* Black CTA Section */}
      < section className="relative py-28 overflow-hidden border-y border-white/10 bg-linear-to-b from-[#020817]/36 via-[#030a1a]/18 to-[#020817]/36" >

        {/* Soft ambient gradient glow */}
        < div className="absolute inset-0 flex justify-center" >
          <div className="w-225 h-100 bg-linear-to-r from-[#5568ff]/28 via-[#9370ff]/30 to-[#78a6ff]/26 blur-3xl opacity-70 animate-floatMedium"></div>
        </div >
        <div className="pointer-events-none absolute left-1/2 top-8 h-52 w-52 -translate-x-1/2 rounded-full bg-[#8fd5ff]/18 blur-3xl animate-floatSlow" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-white">
            Ready to unlock your peak performance?
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Join thousands building unstoppable focus habits and achieving deep work consistently.
          </p>

          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="inline-flex items-center justify-center px-12 py-5 bg-linear-to-r from-[#6b7dff] to-[#8f72ff] text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {session ? 'Go to Dashboard' : 'Create Free Account'} →
          </Link>
        </div>
      </section >

      <footer className="relative overflow-hidden border-t border-white/8 py-16 bg-[#020614]/35 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-32 w-96 rounded-full bg-linear-to-r from-[#5568ff]/0 via-[#5568ff]/20 to-[#5568ff]/0 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link
                href="/"
                className="text-2xl font-black bg-linear-to-r from-[#8fd5ff] to-[#c4b1ff] bg-clip-text text-transparent inline-block mb-4"
              >
                NeuroDesk
              </Link>
              <p className="text-sm text-gray-400">
                Master your focus, own your productivity with intelligent distraction detection and advanced analytics.
              </p>
            </div>
          </div> {/* ✅ closed missing div */}

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">
              NeuroDesk. All rights reserved. Built with focus for the focused.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Twitter', icon: '𝕏' },
                { name: 'GitHub', icon: '⚙' },
                { name: 'Discord', icon: '◆' },
              ].map((social, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#5568ff]/20 border border-white/10 hover:border-[#5568ff]/50 flex items-center justify-center text-sm transition"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {/* Global Animations */}
      < style jsx global > {`

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

      `}</style >

    </div >
  );
}
