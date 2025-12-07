import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import { Theme } from '@/types/theme';
import { Photo } from '@/types/photo';
import { OutroAnimationType } from '@/types/intro-outro';

interface EndingSlideProps {
  message: string;
  theme: Theme;
  style: string;
  showPhotos: boolean;
  photos: Photo[];
  credits?: string[];
  aiContent?: {
    message: string;
    subMessage: string;
    animation: string;
  };
}

export const EndingSlide: React.FC<EndingSlideProps> = ({
  message,
  theme,
  style,
  showPhotos,
  photos,
  credits,
  aiContent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const displayMessage = aiContent?.message || message.split('\n')[0] || message;
  const displaySubMessage = aiContent?.subMessage || message.split('\n')[1] || '';

  const animations = getOutroAnimationStyles(
    style as OutroAnimationType,
    frame,
    fps,
    durationInFrames
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.gradient,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Fade in from previous */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: theme.colors.background,
          opacity: interpolate(frame, [0, fps * 0.5], [1, 0], {
            extrapolateRight: 'clamp',
          }),
        }}
      />

      {/* Photo Collage Background */}
      {showPhotos && style === 'photo-collage' && (
        <PhotoCollage photos={photos} frame={frame} fps={fps} />
      )}

      {/* Heart Gather Animation */}
      {style === 'heart-gather' && (
        <HeartGatherAnimation frame={frame} fps={fps} durationInFrames={durationInFrames} />
      )}

      {/* Fireworks */}
      {style === 'fireworks' && (
        <FireworksAnimation frame={frame} fps={fps} />
      )}

      {/* Confetti */}
      {style === 'confetti' && (
        <ConfettiAnimation frame={frame} fps={fps} />
      )}

      {/* Main Message */}
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          zIndex: 10,
          padding: '0 40px',
          ...animations.container,
        }}
      >
        <h2
          style={{
            fontFamily: theme.fonts.title,
            fontSize: 56,
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginBottom: 16,
            whiteSpace: 'pre-line',
            ...animations.message,
          }}
        >
          {displayMessage}
        </h2>

        {displaySubMessage && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 28,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              ...animations.subMessage,
            }}
          >
            {displaySubMessage}
          </p>
        )}
      </div>

      {/* Credits */}
      {credits && credits.length > 0 && style === 'scroll-credits' && (
        <ScrollingCredits credits={credits} frame={frame} fps={fps} durationInFrames={durationInFrames} />
      )}

      {/* Polaroid Stack */}
      {showPhotos && style === 'polaroid-stack' && (
        <PolaroidStack photos={photos} frame={frame} fps={fps} />
      )}

      {/* Floating Photos */}
      {showPhotos && style === 'flying-photos' && (
        <FlyingPhotos photos={photos} frame={frame} fps={fps} durationInFrames={durationInFrames} />
      )}
    </AbsoluteFill>
  );
};

function getOutroAnimationStyles(
  style: OutroAnimationType,
  frame: number,
  fps: number,
  durationInFrames: number
) {
  const messageDelay = fps * 0.5;
  const subMessageDelay = fps * 1.5;

  switch (style) {
    case 'fade-out':
      return {
        container: {},
        message: {
          opacity: interpolate(
            frame,
            [messageDelay, messageDelay + fps, durationInFrames - fps, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
        },
        subMessage: {
          opacity: interpolate(
            frame,
            [subMessageDelay, subMessageDelay + fps, durationInFrames - fps, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
        },
      };

    case 'zoom-out':
      return {
        container: {
          transform: `scale(${interpolate(
            frame,
            [0, durationInFrames],
            [1.2, 1],
            { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          )})`,
        },
        message: {
          opacity: interpolate(frame, [messageDelay, messageDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        subMessage: {
          opacity: interpolate(frame, [subMessageDelay, subMessageDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    case 'heart-gather':
    case 'fireworks':
    case 'confetti':
      return {
        container: {},
        message: {
          opacity: interpolate(frame, [fps, fps * 2], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `scale(${interpolate(frame, [fps, fps * 2], [0.8, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.5)),
          })})`,
        },
        subMessage: {
          opacity: interpolate(frame, [fps * 2, fps * 3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    default:
      return {
        container: {},
        message: {
          opacity: interpolate(frame, [0, fps], [0, 1], { extrapolateRight: 'clamp' }),
        },
        subMessage: {
          opacity: interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };
  }
}

const PhotoCollage: React.FC<{ photos: Photo[]; frame: number; fps: number }> = ({
  photos,
  frame,
  fps,
}) => {
  const positions = [
    { x: 10, y: 10, rotate: -5, scale: 0.4 },
    { x: 60, y: 5, rotate: 5, scale: 0.35 },
    { x: 5, y: 55, rotate: -8, scale: 0.35 },
    { x: 55, y: 60, rotate: 8, scale: 0.4 },
    { x: 30, y: 30, rotate: 0, scale: 0.3 },
    { x: 70, y: 35, rotate: -3, scale: 0.3 },
  ];

  return (
    <AbsoluteFill style={{ opacity: 0.3 }}>
      {photos.slice(0, 6).map((photo, i) => {
        const pos = positions[i] || positions[0];
        const delay = i * fps * 0.2;
        const opacity = interpolate(frame, [delay, delay + fps], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <Img
            key={photo.id}
            src={photo.thumbnailUrl}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: '25%',
              height: 'auto',
              aspectRatio: '4/3',
              objectFit: 'cover',
              borderRadius: 8,
              transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
              opacity,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const HeartGatherAnimation: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ frame, fps, durationInFrames }) => {
  const hearts = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: 20 + Math.random() * 30,
      delay: Math.random() * fps,
    }));
  }, [fps]);

  return (
    <AbsoluteFill>
      {hearts.map((heart) => {
        const progress = interpolate(
          frame,
          [heart.delay, heart.delay + fps * 2],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        );

        const x = interpolate(progress, [0, 1], [heart.startX, 50]);
        const y = interpolate(progress, [0, 1], [heart.startY, 50]);
        const scale = interpolate(progress, [0, 0.8, 1], [1, 1.2, 0]);

        return (
          <div
            key={heart.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              fontSize: heart.size,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: scale > 0 ? 1 : 0,
            }}
          >
            ❤️
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FireworksAnimation: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fireworks = React.useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
      delay: i * fps * 0.5,
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD'][i],
    }));
  }, [fps]);

  return (
    <AbsoluteFill>
      {fireworks.map((fw) => {
        const progress = (frame - fw.delay) / (fps * 1.5);
        if (progress < 0 || progress > 1) return null;

        const particles = Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = progress * 100;
          return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 1 - progress,
          };
        });

        return (
          <div
            key={fw.id}
            style={{
              position: 'absolute',
              left: `${fw.x}%`,
              top: `${fw.y}%`,
            }}
          >
            {particles.map((p, pi) => (
              <div
                key={pi}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: fw.color,
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const ConfettiAnimation: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const confetti = React.useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 8 + Math.random() * 12,
      speed: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#74B9FF'][
        Math.floor(Math.random() * 6)
      ],
    }));
  }, []);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {confetti.map((c) => {
        const y = c.y + (frame / fps) * c.speed * 20;
        const rotation = c.rotation + frame * c.rotationSpeed;

        if (y > 110) return null;

        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${y}%`,
              width: c.size,
              height: c.size * 0.6,
              backgroundColor: c.color,
              transform: `rotate(${rotation}deg)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ScrollingCredits: React.FC<{
  credits: string[];
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ credits, frame, fps, durationInFrames }) => {
  const scrollY = interpolate(frame, [0, durationInFrames], [100, -50], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${scrollY}%)`,
      }}
    >
      {credits.map((credit, i) => (
        <p
          key={i}
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 8,
          }}
        >
          {credit}
        </p>
      ))}
    </div>
  );
};

const PolaroidStack: React.FC<{ photos: Photo[]; frame: number; fps: number }> = ({
  photos,
  frame,
  fps,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: -40,
      }}
    >
      {photos.slice(0, 4).map((photo, i) => {
        const delay = i * fps * 0.3;
        const progress = interpolate(frame, [delay, delay + fps], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.back(1.5)),
        });
        const rotate = (i - 1.5) * 8;

        return (
          <div
            key={photo.id}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '8px 8px 24px 8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transform: `rotate(${rotate}deg) scale(${progress}) translateY(${(1 - progress) * 50}px)`,
              opacity: progress,
              zIndex: photos.length - i,
            }}
          >
            <Img
              src={photo.thumbnailUrl}
              style={{
                width: 120,
                height: 90,
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const FlyingPhotos: React.FC<{
  photos: Photo[];
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ photos, frame, fps, durationInFrames }) => {
  return (
    <AbsoluteFill>
      {photos.slice(0, 6).map((photo, i) => {
        const delay = i * fps * 0.4;
        const startX = 50 + (Math.random() - 0.5) * 20;
        const endX = (Math.random() - 0.5) * 200;
        const endY = -150;

        const progress = interpolate(
          frame,
          [delay, delay + fps * 3],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const x = interpolate(progress, [0, 1], [startX, startX + endX]);
        const y = interpolate(progress, [0, 1], [50, endY], {
          easing: Easing.in(Easing.quad),
        });
        const rotate = interpolate(progress, [0, 1], [0, (Math.random() - 0.5) * 60]);
        const scale = interpolate(progress, [0, 0.3, 1], [0, 1, 0.3]);

        return (
          <Img
            key={photo.id}
            src={photo.thumbnailUrl}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 100,
              height: 75,
              objectFit: 'cover',
              borderRadius: 4,
              transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default EndingSlide;
