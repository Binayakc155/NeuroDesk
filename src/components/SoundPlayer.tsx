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

export default function SoundPlayer({ isPlaying }: SoundPlayerProps) {
  const [items, setItems] = useState<SpotifyItem[]>(DEFAULT_ITEMS);
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

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setItemName('');
    setItemUrl('');
    setShowAddForm(false);
    setError(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(items[0].id);
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
    <div className="overflow-hidden rounded-3xl border border-[#d9d5c8] bg-linear-to-br from-[#fffef9] via-[#f9f5e8] to-[#f1f8f4] p-5 shadow-[0_12px_28px_rgba(62,70,64,0.12)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#617368]">Soundscape</p>
          <h3 className="text-xl font-semibold text-[#1d2b23]">Spotify Focus Player</h3>
          <p className="mt-1 text-xs text-[#5a6a60] sm:text-sm">
            {isPlaying
              ? 'Session active: keep the flow going with uninterrupted sound.'
              : 'Set your mood first, then start your deep-work session.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${isPlaying ? 'bg-[#dff5eb] text-[#1a7a5b]' : 'bg-[#f2eee2] text-[#5a655f]'
              }`}
          >
            {isPlaying ? 'Session Live' : 'Session Idle'}
          </span>
          <button
            onClick={() => setShowOptions((prev) => !prev)}
            className="rounded-full border border-[#d4d0c3] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#44564d] transition hover:bg-white"
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
                      ? 'border-[#0f7a5d] bg-[#0f7a5d] text-white shadow-[0_6px_18px_rgba(15,122,93,0.35)]'
                      : 'border-[#d7d3c7] bg-white/85 text-[#495a51] hover:bg-white'
                    }`}
                >
                  <span className="block">{item.name}</span>
                  <span
                    className={`block text-[10px] uppercase tracking-wide ${selectedId === item.id ? 'text-[#d7f4ea]' : 'text-[#819086]'
                      }`}
                  >
                    {itemTypeLabel(item.type)}
                  </span>
                </button>
                {item.isCustom && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute -right-1 -top-1 rounded-full bg-[#fce8e5] px-1.5 py-0.5 text-[10px] font-semibold text-[#b8554c]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAddItem} className="mb-4 space-y-3 rounded-2xl border border-[#e4dfd2] bg-white/75 p-4">
              <input
                type="text"
                placeholder="Name (optional)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full rounded-lg border border-[#d9d5c8] bg-white px-3 py-2 text-sm text-[#25352d] placeholder:text-[#90a095] outline-none transition focus:border-[#0f7a5d]"
              />
              <input
                type="url"
                placeholder="Paste Spotify link (playlist, album, track)"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                required
                className="w-full rounded-lg border border-[#d9d5c8] bg-white px-3 py-2 text-sm text-[#25352d] placeholder:text-[#90a095] outline-none transition focus:border-[#0f7a5d]"
              />
              {error && <p className="text-sm text-[#b8554c]">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0f7a5d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b644c]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  className="rounded-lg border border-[#d9d5c8] bg-white px-4 py-2 text-sm font-medium text-[#4a5d53] transition hover:bg-[#f8f6ef]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 rounded-lg border border-dashed border-[#c8d4cd] bg-[#eef7f1] px-3 py-2 text-sm font-medium text-[#1d7459] transition hover:bg-[#e4f3ea]"
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