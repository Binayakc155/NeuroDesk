'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface WhitelistedDomain {
  id: string;
  domain: string;
  description: string | null;
  createdAt: string;
}

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<WhitelistedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDomains();
    }
  }, [status]);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/whitelist');
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newDomain.trim()) {
      setError('Domain is required');
      return;
    }

    setAdding(true);

    try {
      const res = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain.trim(),
          description: newDescription.trim() || null,
        }),
      });

      if (res.ok) {
        const newWhitelistedDomain = await res.json();
        setDomains([newWhitelistedDomain, ...domains]);
        setNewDomain('');
        setNewDescription('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add domain');
      }
    } catch (error) {
      setError('Failed to add domain');
      console.error('Error adding domain:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('Remove this domain from whitelist?')) return;

    try {
      const res = await fetch(`/api/whitelist/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDomains(domains.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#0e1117] text-slate-100 overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-white hover:text-blue-400 transition"
          >
            NeuroDesk
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-slate-400 hover:text-rose-400 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 text-sm font-semibold hover:gap-3 transition-all"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-white mb-3">Settings</h1>
          <p className="text-slate-400 text-lg">Manage your focus session preferences</p>
        </div>

        {/* Whitelist Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Allowed Websites</h2>
            <p className="text-slate-400">
              Add websites that you use for work. Switching to these tabs won&apos;t count as distractions.
            </p>
          </div>

          {/* Add Domain Form */}
          <form onSubmit={handleAddDomain} className="mb-8">
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="github.com"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/10 transition-all"
                disabled={adding}
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/10 transition-all"
                disabled={adding}
              />
              <button
                type="submit"
                disabled={adding}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:hover:shadow-blue-500/20"
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
            {error && (
              <p className="text-rose-400 text-sm">{error}</p>
            )}
          </form>

          {/* Domain List */}
          <div className="space-y-3">
            {domains.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-xl border-2 border-dashed border-white/20">
                <p className="text-slate-100 font-semibold mb-1">No whitelisted domains yet</p>
                <p className="text-sm text-slate-400">Add websites you use for work to prevent false distractions</p>
              </div>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="group flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                >
                  <div>
                    <p className="font-bold text-white">{domain.domain}</p>
                    {domain.description && (
                      <p className="text-sm text-slate-400">{domain.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-rose-600/20 rounded-lg text-sm font-bold transition-all opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white/5 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 shadow-2xl shadow-yellow-500/10">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Current Limitations</h3>
          <ul className="text-sm text-slate-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">⚠</span>
              <span><strong>Whitelist currently disabled:</strong> The browser&apos;s Page Visibility API can only detect when you leave this tab, but cannot see which site/app you switched to.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">⚠</span>
              <span><strong>All tab switches tracked:</strong> Any time you leave this tab for more than 3 seconds counts as a distraction for now.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">ℹ</span>
              <span><strong>Future enhancement:</strong> A browser extension would be needed to properly check which domains you visit against this whitelist.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">ℹ</span>
              <span>Desktop apps (VS Code, Slack, etc.) can&apos;t be detected by browsers at all.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
