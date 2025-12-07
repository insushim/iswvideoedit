import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { Photo, KenBurnsConfig } from '@/types/photo';
import { Theme } from '@/types/theme';

interface PhotoSlideProps {
  photo: Photo;
  effect: string;
  kenBurns?: KenBurnsConfig;
  theme: Theme;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: number;
    sepia?: number;
  };
}

export const PhotoSlide: React.FC<PhotoSlideProps> = ({
  photo,
  effect,
  kenBurns,
  theme,
  filters,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Parse Ken Burns effect from effect string if not explicitly provided
  const effectiveKenBurns = kenBurns || parseKenBurnsEffect(effect);

  const progress = frame / durationInFrames;

  // Calculate scale animation
  const scale = interpolate(
    progress,
    [0, 1],
    [effectiveKenBurns.startScale, effectiveKenBurns.endScale],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Calculate position animation
  const translateX = interpolate(
    progress,
    [0, 1],
    [
      (effectiveKenBurns.startPosition.x - 0.5) * 100,
      (effectiveKenBurns.endPosition.x - 0.5) * 100,
    ],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    }
  );

  const translateY = interpolate(
    progress,
    [0, 1],
    [
      (effectiveKenBurns.startPosition.y - 0.5) * 100,
      (effectiveKenBurns.endPosition.y - 0.5) * 100,
    ],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Fade in animation
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.ease,
  });

  // Build CSS filter string
  const buildFilterString = (): string => {
    if (!filters) return 'none';

    const filterParts: string[] = [];

    if (filters.brightness !== undefined && filters.brightness !== 1) {
      filterParts.push(`brightness(${filters.brightness})`);
    }
    if (filters.contrast !== undefined && filters.contrast !== 1) {
      filterParts.push(`contrast(${filters.contrast})`);
    }
    if (filters.saturation !== undefined && filters.saturation !== 1) {
      filterParts.push(`saturate(${filters.saturation})`);
    }
    if (filters.blur !== undefined && filters.blur > 0) {
      filterParts.push(`blur(${filters.blur}px)`);
    }
    if (filters.grayscale !== undefined && filters.grayscale > 0) {
      filterParts.push(`grayscale(${filters.grayscale})`);
    }
    if (filters.sepia !== undefined && filters.sepia > 0) {
      filterParts.push(`sepia(${filters.sepia})`);
    }

    return filterParts.length > 0 ? filterParts.join(' ') : 'none';
  };

  return (
    <AbsoluteFill style={{ opacity, overflow: 'hidden' }}>
      <Img
        src={photo.url}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          filter: buildFilterString(),
        }}
      />

      {/* Vignette overlay */}
      {effect.includes('vignette') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Text Overlay */}
      {photo.textOverlay && (
        <TextOverlayComponent
          overlay={photo.textOverlay}
          frame={frame}
          fps={fps}
          durationInFrames={durationInFrames}
        />
      )}
    </AbsoluteFill>
  );
};

interface TextOverlayComponentProps {
  overlay: Photo['textOverlay'];
  frame: number;
  fps: number;
  durationInFrames: number;
}

const TextOverlayComponent: React.FC<TextOverlayComponentProps> = ({
  overlay,
  frame,
  fps,
  durationInFrames,
}) => {
  if (!overlay) return null;

  const fadeInDuration = fps * 0.5;
  const fadeOutStart = durationInFrames - fps * 0.5;

  const opacity = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [0, fadeInDuration],
    [20, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: `${overlay.position.x}%`,
        top: `${overlay.position.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        opacity,
        fontFamily: overlay.style.fontFamily || 'Pretendard',
        fontSize: overlay.style.fontSize || 24,
        fontWeight: overlay.style.fontWeight || 500,
        color: overlay.style.color || '#FFFFFF',
        backgroundColor: overlay.style.backgroundColor || 'rgba(0,0,0,0.5)',
        padding: '12px 24px',
        borderRadius: '8px',
        textShadow: overlay.style.textShadow || '0 2px 4px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}
    >
      {overlay.text}
    </div>
  );
};

function parseKenBurnsEffect(effect: string): KenBurnsConfig {
  const effects: Record<string, KenBurnsConfig> = {
    'kenburns-zoom-in': {
      startScale: 1,
      endScale: 1.15,
      startPosition: { x: 0.5, y: 0.5 },
      endPosition: { x: 0.5, y: 0.5 },
    },
    'kenburns-zoom-out': {
      startScale: 1.15,
      endScale: 1,
      startPosition: { x: 0.5, y: 0.5 },
      endPosition: { x: 0.5, y: 0.5 },
    },
    'kenburns-pan-left': {
      startScale: 1.1,
      endScale: 1.1,
      startPosition: { x: 0.6, y: 0.5 },
      endPosition: { x: 0.4, y: 0.5 },
    },
    'kenburns-pan-right': {
      startScale: 1.1,
      endScale: 1.1,
      startPosition: { x: 0.4, y: 0.5 },
      endPosition: { x: 0.6, y: 0.5 },
    },
    'kenburns-pan-up': {
      startScale: 1.1,
      endScale: 1.1,
      startPosition: { x: 0.5, y: 0.6 },
      endPosition: { x: 0.5, y: 0.4 },
    },
    'kenburns-pan-down': {
      startScale: 1.1,
      endScale: 1.1,
      startPosition: { x: 0.5, y: 0.4 },
      endPosition: { x: 0.5, y: 0.6 },
    },
    'kenburns-diagonal-tl': {
      startScale: 1.15,
      endScale: 1,
      startPosition: { x: 0.6, y: 0.6 },
      endPosition: { x: 0.4, y: 0.4 },
    },
    'kenburns-diagonal-tr': {
      startScale: 1.15,
      endScale: 1,
      startPosition: { x: 0.4, y: 0.6 },
      endPosition: { x: 0.6, y: 0.4 },
    },
    'kenburns-diagonal-bl': {
      startScale: 1.15,
      endScale: 1,
      startPosition: { x: 0.6, y: 0.4 },
      endPosition: { x: 0.4, y: 0.6 },
    },
    'kenburns-diagonal-br': {
      startScale: 1.15,
      endScale: 1,
      startPosition: { x: 0.4, y: 0.4 },
      endPosition: { x: 0.6, y: 0.6 },
    },
  };

  return (
    effects[effect] || {
      startScale: 1,
      endScale: 1.1,
      startPosition: { x: 0.5, y: 0.5 },
      endPosition: { x: 0.5, y: 0.5 },
    }
  );
}

export default PhotoSlide;
