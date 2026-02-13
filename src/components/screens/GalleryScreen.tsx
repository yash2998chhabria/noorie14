import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { photos, getPhotosByYear } from '../../data/photos';
import { Button } from '../shared/Button';

export function GalleryScreen() {
  const { state, dispatch } = useGame();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(0); // 0 = all

  const displayPhotos = selectedYear === 0
    ? photos
    : getPhotosByYear(selectedYear);

  const selectedEntry = selectedPhoto ? photos.find(p => p.id === selectedPhoto) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      display: 'flex', flexDirection: 'column',
      padding: '20px',
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#fff', fontSize: 22, fontWeight: 700, margin: 0,
        }}>
          Gallery
        </h2>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
          Back
        </Button>
      </div>

      {/* Year filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4].map(year => (
          <motion.button
            key={year}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              background: selectedYear === year ? '#ff6b9d' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 13,
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedYear(year)}
          >
            {year === 0 ? 'All' : `Year ${year}`}
          </motion.button>
        ))}
      </div>

      {/* Photo grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        flex: 1,
      }}>
        {displayPhotos.map((photo, i) => {
          const isUnlocked = state.unlockedPhotos.includes(photo.id);
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: isUnlocked ? 'pointer' : 'default',
                position: 'relative',
                background: isUnlocked
                  ? 'linear-gradient(135deg, #ff6b9d20, #7c4dff20)'
                  : 'rgba(255,255,255,0.05)',
              }}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              onClick={() => isUnlocked && setSelectedPhoto(photo.id)}
            >
              {isUnlocked ? (
                photo.mediaType === 'video' ? (
                  <video
                    src={photo.src}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={photo.thumbnail}
                    alt={photo.caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, opacity: 0.3,
                }}>
                  {'\uD83D\uDD12'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13, textAlign: 'center',
        marginTop: 12,
      }}>
        {state.unlockedPhotos.length} / {photos.length} memories unlocked
      </div>

      {/* Full view modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 70, padding: 20,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              style={{
                background: '#fff',
                padding: '12px 12px 40px',
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                maxWidth: 300,
              }}
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: -2 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: 276, height: 220,
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                {selectedEntry.mediaType === 'video' ? (
                  <video
                    src={selectedEntry.src}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    src={selectedEntry.src}
                    alt={selectedEntry.caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <p style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 14, color: '#333',
                textAlign: 'center', marginTop: 12,
                fontStyle: 'italic',
              }}>
                {selectedEntry.caption}
              </p>
            </motion.div>

            <motion.p
              style={{
                fontFamily: "'Quicksand', sans-serif",
                color: 'rgba(255,255,255,0.5)',
                fontSize: 12, marginTop: 16,
              }}
            >
              Tap outside to close
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
