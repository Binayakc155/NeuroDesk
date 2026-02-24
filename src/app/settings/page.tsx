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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            NeuroDesk
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:gap-3 transition-all"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Settings</h1>
          <p className="text-gray-600 text-lg">Manage your focus session preferences</p>
        </div>

        {/* Whitelist Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Allowed Websites</h2>
            <p className="text-gray-600">
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
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                disabled={adding}
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                disabled={adding}
              />
              <button
                type="submit"
                disabled={adding}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </form>

          {/* Domain List */}
          <div className="space-y-3">
            {domains.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-700 font-semibold mb-1">No whitelisted domains yet</p>
                <p className="text-sm text-gray-500">Add websites you use for work to prevent false distractions</p>
              </div>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="group flex items-center justify-between p-5 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-bold text-gray-900">{domain.domain}</p>
                    {domain.description && (
                      <p className="text-sm text-gray-600">{domain.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg text-sm font-bold transition-all opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-linear-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-black text-orange-900 mb-4">Current Limitations</h3>
          <ul className="text-sm text-orange-800 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">⚠</span>
              <span><strong>Whitelist currently disabled:</strong> The browser&apos;s Page Visibility API can only detect when you leave this tab, but cannot see which site/app you switched to.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">⚠</span>
              <span><strong>All tab switches tracked:</strong> Any time you leave this tab for more than 3 seconds counts as a distraction for now.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">ℹ</span>
              <span><strong>Future enhancement:</strong> A browser extension would be needed to properly check which domains you visit against this whitelist.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">ℹ</span>
              <span>Desktop apps (VS Code, Slack, etc.) can&apos;t be detected by browsers at all.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
