'use client';

import { useEffect, useRef, useState } from 'react';

export type SoundType =
  | 'none'
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'coffee'
  | 'whitenoise'
  | 'lofi'
  | string;

interface Sound {
  id: SoundType;
  name: string;
  url: string;
  icon: string;
  isCustom?: boolean;
}

const SOUNDS: Sound[] = [
  { id: 'none', name: 'No Sound', url: '', icon: '🔇' },
  {
    id: 'rain',
    name: 'Rain',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112ce8f.mp3',
    icon: '🌧️',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_8c6b29e3d8.mp3',
    icon: '🌊',
  },
  {
    id: 'forest',
    name: 'Forest',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4dedf1f94f.mp3',
    icon: '🌲',
  },
  {
    id: 'coffee',
    name: 'Coffee Shop',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c9c9ee6f20.mp3',
    icon: '☕',
  },
  {
    id: 'whitenoise',
    name: 'White Noise',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_bb630cc098.mp3',
    icon: '📻',
  },
  {
    id: 'lofi',
    name: 'Lo-fi Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe05c21.mp3',
    icon: '🎵',
  },
    {
      id: 'calmpiano',
      name: 'Calm Piano',
      url: 'https://cdn.pixabay.com/audio/2023/03/28/audio_1e1e1e1e1e.mp3',
      icon: '🎹',
    },
];

interface SoundPlayerProps {
  isPlaying: boolean;
  onSoundChange?: (soundId: SoundType) => void;
}

export default function SoundPlayer({
  isPlaying,
  onSoundChange,
}: SoundPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedSound, setSelectedSound] =
    useState<SoundType>('none');
  const [volume, setVolume] = useState<number>(50);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);
  const [showAddSound, setShowAddSound] = useState<boolean>(false);
  const [newSoundName, setNewSoundName] = useState<string>('');
  const [newSoundUrl, setNewSoundUrl] = useState<string>('');
  const [newSoundIcon, setNewSoundIcon] = useState<string>('🎵');
  const [adding, setAdding] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] =
    useState<boolean>(false);

  const allSounds: Sound[] = [...SOUNDS, ...customSounds];

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play / Pause logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async (): Promise<void> => {
      if (!hasUserInteracted && selectedSound !== 'none') {
        return;
      }

      try {
        setAudioError(null);

        if (isPlaying && selectedSound !== 'none') {
          if (audio.paused) {
            await audio.play();
          }
        } else {
          if (!audio.paused) {
            audio.pause();
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setAudioError('Click a sound to enable audio');
          } else if (error.name === 'NotSupportedError') {
            setAudioError('Audio format not supported');
          } else {
            setAudioError(error.message);
          }
        } else {
          setAudioError('Unknown audio error');
        }
      }
    };

    playAudio();
  }, [isPlaying, selectedSound, hasUserInteracted]);

  const handleSoundChange = (soundId: SoundType): void => {
    setHasUserInteracted(true);
    setSelectedSound(soundId);
    onSoundChange?.(soundId);
  };

  const handleAddSound = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!newSoundName || !newSoundUrl) return;

    setAdding(true);

    const newSound: Sound = {
      id: Date.now().toString(),
      name: newSoundName,
      url: newSoundUrl,
      icon: newSoundIcon || '🎵',
      isCustom: true,
    };

    setCustomSounds((prev) => [...prev, newSound]);

    setNewSoundName('');
    setNewSoundUrl('');
    setNewSoundIcon('🎵');
    setShowAddSound(false);
    setAdding(false);
  };

  const handleDeleteSound = (soundId: string): void => {
    setCustomSounds((prev) =>
      prev.filter((sound) => sound.id !== soundId)
    );

    if (selectedSound === soundId) {
      setSelectedSound('none');
    }
  };

  const currentSound =
    allSounds.find((sound) => sound.id === selectedSound) ??
    null;

  return (
    <div className="bg-white rounded-xl shadow-lg border p-5">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 items-center">
          <span className="text-2xl">
            {currentSound?.icon ?? '🔇'}
          </span>
          <h3 className="font-bold">Focus Sounds</h3>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-sm text-blue-600"
        >
          {isExpanded ? 'Hide' : 'Change'}
        </button>
      </div>

      {selectedSound !== 'none' ? (
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Volume</span>
            <span>{volume}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) =>
              setVolume(Number(e.target.value))
            }
            className="w-full"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          No sound selected
        </p>
      )}

      {audioError && (
        <p className="text-xs text-red-600 mb-3">
          {audioError}
        </p>
      )}

      {isExpanded && (
        <>
          {showAddSound ? (
            <form
              onSubmit={handleAddSound}
              className="mb-4 space-y-2"
            >
              <input
                value={newSoundIcon}
                onChange={(e) =>
                  setNewSoundIcon(e.target.value)
                }
                maxLength={2}
                className="w-16 border p-2"
              />

              <input
                value={newSoundName}
                onChange={(e) =>
                  setNewSoundName(e.target.value)
                }
                placeholder="Sound name"
                required
                className="w-full border p-2"
              />

              <input
                type="url"
                value={newSoundUrl}
                onChange={(e) =>
                  setNewSoundUrl(e.target.value)
                }
                placeholder="https://example.com/audio.mp3"
                required
                className="w-full border p-2"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddSound(false);
                    setNewSoundName('');
                    setNewSoundUrl('');
                    setNewSoundIcon('🎵');
                    setAudioError(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddSound(true)}
              className="mb-4 text-sm text-blue-600"
            >
              + Add Your Own Sound
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {allSounds.map((sound) => (
              <div key={sound.id} className="relative">
                <button
                  onClick={() =>
                    handleSoundChange(sound.id)
                  }
                  className={`w-full p-2 border rounded ${
                    selectedSound === sound.id
                      ? 'bg-blue-100 border-blue-500'
                      : ''
                  }`}
                >
                  {sound.icon} {sound.name}
                </button>

                {sound.isCustom && (
                  <button
                    onClick={() =>
                      handleDeleteSound(sound.id)
                    }
                    className="absolute top-1 right-1 text-xs text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSound !== 'none' &&
        currentSound?.url && (
          <audio
            ref={audioRef}
            src={currentSound.url}
            loop
            preload="auto"
          />
        )}
    </div>
  );
}