'use client';

import { useState } from 'react';

interface SoundPlayerProps {
  isPlaying: boolean;
}

interface SpotifyItem {
  id: string;
  name: string;
  type: 'playlist' | 'album' | 'track';
  isCustom?: boolean;
}

const DEFAULT_ITEMS: SpotifyItem[] = [
  { name: 'Deep Focus', id: '37i9dQZF1DX8NTLI2TtZa6', type: 'playlist' },
  { name: 'Lo-Fi Beats', id: '37i9dQZF1DXcBWIGoYBM5M', type: 'playlist' },
  { name: 'Peaceful Piano', id: '37i9dQZF1DWZqd5JICZI0u', type: 'playlist' },
];

const STORAGE_KEY = 'neurodesk_spotify_custom_items';

export default function SoundPlayer({ isPlaying }: SoundPlayerProps) {
  const [items, setItems] = useState<SpotifyItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const custom: SpotifyItem[] = stored ? JSON.parse(stored) : [];
      return [...DEFAULT_ITEMS, ...custom];
    } catch {
      return DEFAULT_ITEMS;
    }
  });
  const [selectedId, setSelectedId] = useState(items[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(true);

  const extractSpotifyId = (url: string): { id: string; type: 'playlist' | 'album' | 'track' } | null => {
    let match = url.match(/playlist\/([a-zA-Z0-9]+)/) || url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
    if (match) return { id: match[1], type: 'playlist' };

    match = url.match(/album\/([a-zA-Z0-9]+)/) || url.match(/spotify:album:([a-zA-Z0-9]+)/);
    if (match) return { id: match[1], type: 'album' };

    match = url.match(/track\/([a-zA-Z0-9]+)/) || url.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (match) return { id: match[1], type: 'track' };

    return null;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const extracted = extractSpotifyId(itemUrl);
    if (!extracted) {
      setError('Invalid Spotify link (playlist, album, or track only)');
      return;
    }

    const newItem: SpotifyItem = {
      id: extracted.id,
      name: itemName || 'Custom Spotify Item',
      type: extracted.type,
      isCustom: true,
    };

    setItems((prev) => {
      const updated = [...prev, newItem];
      const custom = updated.filter((i) => i.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
      return updated;
    });
    setSelectedId(newItem.id);
    setItemName('');
    setItemUrl('');
    setShowAddForm(false);
    setError(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      const custom = updated.filter((i) => i.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
      return updated;
    });
    if (selectedId === id) setSelectedId(DEFAULT_ITEMS[0].id);
  };

  const embedUrl = (item: SpotifyItem) =>
    `https://open.spotify.com/embed/${item.type}/${item.id}`;

  const selectedItem = items.find((i) => i.id === selectedId);

  const itemTypeLabel = (type: SpotifyItem['type']) => {
    if (type === 'playlist') return 'Playlist';
    if (type === 'album') return 'Album';
    return 'Track';
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#0b1020]/88 via-[#0f1530]/85 to-[#12142a]/88 p-5 shadow-[0_20px_48px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Soundscape</p>
          <h3 className="text-xl font-semibold text-white">Spotify Focus Player</h3>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            {isPlaying
              ? 'Session active: keep the flow going with uninterrupted sound.'
              : 'Set your mood first, then start your deep-work session.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${isPlaying ? 'bg-[#16253f] text-[#9ed3ff]' : 'bg-white/8 text-slate-300'
              }`}
          >
            {isPlaying ? 'Session Live' : 'Session Idle'}
          </span>
          <button
            onClick={() => setShowOptions((prev) => !prev)}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {showOptions ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      </div>

      {showOptions && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setSelectedId(item.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition sm:px-4 ${selectedId === item.id
                    ? 'border-[#7189ff] bg-linear-to-r from-[#6377ff] to-[#8d71ff] text-white shadow-[0_8px_20px_rgba(99,119,255,0.35)]'
                    : 'border-white/10 bg-white/6 text-slate-200 hover:bg-white/10'
                    }`}
                >
                  <span className="block">{item.name}</span>
                  <span
                    className={`block text-[10px] uppercase tracking-wide ${selectedId === item.id ? 'text-[#dce3ff]' : 'text-slate-500'
                      }`}
                  >
                    {itemTypeLabel(item.type)}
                  </span>
                </button>
                {item.isCustom && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute -right-1 -top-1 rounded-full bg-[#331827] px-1.5 py-0.5 text-[10px] font-semibold text-rose-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAddItem} className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/6 p-4">
              <input
                type="text"
                placeholder="Name (optional)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0b1122] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-[#7189ff]"
              />
              <input
                type="url"
                placeholder="Paste Spotify link (playlist, album, track)"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-[#0b1122] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-[#7189ff]"
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-linear-to-r from-[#6377ff] to-[#8d71ff] px-4 py-2 text-sm font-semibold text-white transition hover:from-[#7687ff] hover:to-[#a286ff]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  className="rounded-lg border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 rounded-lg border border-dashed border-white/12 bg-white/6 px-3 py-2 text-sm font-medium text-[#b7c7ff] transition hover:bg-white/10"
            >
              + Add Spotify Item
            </button>
          )}
        </>
      )}

      {selectedItem && (
        <iframe
          style={{ borderRadius: '12px' }}
          src={embedUrl(selectedItem)}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </div>
  );
}