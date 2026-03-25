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
      <div className="dashboard-shell min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-[#2bc7b7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="dashboard-shell relative min-h-screen overflow-hidden pt-20 text-slate-100 md:pt-24">

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#7bd4ff]/20 bg-[#04101f]/72 shadow-[0_10px_40px_rgba(4,10,20,0.55)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-white hover:text-[#9de9ff] transition"
          >
            NeuroDesk
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-full border border-[#6ab5dc]/30 bg-[#0a1a2e]/65 px-3 py-1.5 text-sm font-medium text-[#d3f3ff] transition hover:border-[#8de1ff]/60 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        {/* Navigation */}
      

        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-white mb-3">Settings</h1>
          <p className="text-slate-400 text-lg">Manage your focus session preferences</p>
        </div>

        {/* Whitelist Section */}
        <div className="bg-[#08101f]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-8 shadow-[0_18px_46px_rgba(0,0,0,0.35)]">
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
                className="px-4 py-3 bg-[#0b1122] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2bc7b7] focus:border-transparent focus:bg-[#0f2036] transition-all"
                disabled={adding}
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="px-4 py-3 bg-[#0b1122] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2bc7b7] focus:border-transparent focus:bg-[#0f2036] transition-all"
                disabled={adding}
              />
              <button
                type="submit"
                disabled={adding}
                className="px-6 py-3 bg-linear-to-r from-[#14b8a6] to-[#3b82f6] hover:from-[#2dd4bf] hover:to-[#60a5fa] disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl transition-all shadow-lg"
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
                  className="group flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:border-[#67d8ff]/45 hover:shadow-lg hover:shadow-[#2bc7b7]/10 transition-all"
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
        <div className="bg-white/5 backdrop-blur-xl border border-[#66d8f5]/32 rounded-3xl p-8 shadow-2xl shadow-[#2bc7b7]/10">
          <h3 className="text-xl font-semibold text-[#99e8ff] mb-4">Current Limitations</h3>
          <ul className="text-sm text-slate-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-amber-300 font-bold">⚠</span>
              <span><strong>Whitelist currently disabled:</strong> The browser&apos;s Page Visibility API can only detect when you leave this tab, but cannot see which site/app you switched to.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-300 font-bold">⚠</span>
              <span><strong>All tab switches tracked:</strong> Any time you leave this tab for more than 3 seconds counts as a distraction for now.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#7de9ff] font-bold">ℹ</span>
              <span><strong>Future enhancement:</strong> A browser extension would be needed to properly check which domains you visit against this whitelist.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#7de9ff] font-bold">ℹ</span>
              <span>Desktop apps (VS Code, Slack, etc.) can&apos;t be detected by browsers at all.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
