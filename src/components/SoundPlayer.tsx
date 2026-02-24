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
  const [showOptions, setShowOptions] = useState(true); // <-- New state

  if (!isPlaying) return null;

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

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
        🎧 Spotify Player
        <button
          onClick={() => setShowOptions((prev) => !prev)}
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          {showOptions ? 'Hide Options' : 'Show Options'}
        </button>
      </h3>

      {showOptions && (
        <>
          {/* Item selector buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setSelectedId(item.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition ${
                    selectedId === item.id
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {item.name}
                </button>
                {item.isCustom && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute -top-2 -right-2 text-xs text-rose-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new item */}
          {showAddForm ? (
            <form onSubmit={handleAddItem} className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Name (optional)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full p-2 rounded bg-white/10 text-white border border-white/10"
              />
              <input
                type="url"
                placeholder="Paste Spotify link (playlist, album, track)"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                required
                className="w-full p-2 rounded bg-white/10 text-white border border-white/10"
              />
              {error && <p className="text-rose-400 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-white/10 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 text-sm text-violet-400 hover:text-violet-300"
            >
              + Add Spotify Item
            </button>
          )}
        </>
      )}

      {/* Embed player */}
      {items.find((i) => i.id === selectedId) && (
        <iframe
          style={{ borderRadius: '12px' }}
          src={embedUrl(items.find((i) => i.id === selectedId)!)}
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