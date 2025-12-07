import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import { Theme } from '@/types/theme';
import { IntroAnimationType } from '@/types/intro-outro';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  date?: string;
  theme: Theme;
  style: string;
  aiContent?: {
    title: string;
    subtitle: string;
    animation: string;
  };
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  date,
  theme,
  style,
  aiContent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const displayTitle = aiContent?.title || title;
  const displaySubtitle = aiContent?.subtitle || subtitle;

  const animations = getAnimationStyles(style as IntroAnimationType, frame, fps, durationInFrames);

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.gradient,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern/Particles */}
      {style === 'particles' && (
        <ParticlesBackground frame={frame} colors={[theme.colors.accent, '#FFFFFF']} />
      )}

      {/* Decorative Elements */}
      <DecoElements style={style} frame={frame} fps={fps} theme={theme} />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          zIndex: 10,
          ...animations.container,
        }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.title,
            fontSize: 72,
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginBottom: 16,
            ...animations.title,
          }}
        >
          {displayTitle}
        </h1>

        {displaySubtitle && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 32,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              ...animations.subtitle,
            }}
          >
            {displaySubtitle}
          </p>
        )}

        {date && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 24,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 24,
              ...animations.date,
            }}
          >
            {date}
          </p>
        )}
      </div>

      {/* Fade out at the end */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: theme.colors.background,
          opacity: interpolate(
            frame,
            [durationInFrames - fps * 0.5, durationInFrames],
            [0, 1],
            { extrapolateLeft: 'clamp' }
          ),
        }}
      />
    </AbsoluteFill>
  );
};

function getAnimationStyles(
  style: IntroAnimationType,
  frame: number,
  fps: number,
  durationInFrames: number
) {
  const titleDelay = 0.5 * fps;
  const subtitleDelay = 1.5 * fps;
  const dateDelay = 2.5 * fps;

  switch (style) {
    case 'fade-zoom':
      return {
        container: {},
        title: {
          opacity: interpolate(frame, [titleDelay, titleDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `scale(${interpolate(
            frame,
            [titleDelay, titleDelay + fps],
            [0.8, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )})`,
        },
        subtitle: {
          opacity: interpolate(frame, [subtitleDelay, subtitleDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        date: {
          opacity: interpolate(frame, [dateDelay, dateDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    case 'slide-up':
      return {
        container: {},
        title: {
          opacity: interpolate(frame, [titleDelay, titleDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(
            frame,
            [titleDelay, titleDelay + fps],
            [50, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          )}px)`,
        },
        subtitle: {
          opacity: interpolate(frame, [subtitleDelay, subtitleDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(
            frame,
            [subtitleDelay, subtitleDelay + fps],
            [30, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          )}px)`,
        },
        date: {
          opacity: interpolate(frame, [dateDelay, dateDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    case 'bounce':
      const bounceProgress = spring({
        frame: frame - titleDelay,
        fps,
        config: { damping: 12, stiffness: 100, mass: 0.5 },
      });
      return {
        container: {},
        title: {
          opacity: frame > titleDelay ? 1 : 0,
          transform: `scale(${bounceProgress})`,
        },
        subtitle: {
          opacity: interpolate(frame, [subtitleDelay, subtitleDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        date: {
          opacity: interpolate(frame, [dateDelay, dateDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    case 'typewriter':
      const titleLength = Math.floor(
        interpolate(frame, [titleDelay, titleDelay + fps * 2], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }) * 100
      );
      return {
        container: {},
        title: {
          clipPath: `inset(0 ${100 - titleLength}% 0 0)`,
        },
        subtitle: {
          opacity: interpolate(frame, [subtitleDelay + fps, subtitleDelay + fps * 2], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        date: {
          opacity: interpolate(frame, [dateDelay, dateDelay + fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    case 'cinematic':
      return {
        container: {
          transform: `scale(${interpolate(
            frame,
            [0, durationInFrames],
            [1.1, 1],
            { extrapolateRight: 'clamp' }
          )})`,
        },
        title: {
          opacity: interpolate(frame, [fps, fps * 2], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          letterSpacing: `${interpolate(frame, [fps, fps * 2], [20, 5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px`,
        },
        subtitle: {
          opacity: interpolate(frame, [fps * 2.5, fps * 3.5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        date: {
          opacity: interpolate(frame, [fps * 3, fps * 4], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };

    default:
      return {
        container: {},
        title: {
          opacity: interpolate(frame, [0, fps], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        },
        subtitle: {
          opacity: interpolate(frame, [fps, fps * 2], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
        date: {
          opacity: interpolate(frame, [fps * 1.5, fps * 2.5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        },
      };
  }
}

const ParticlesBackground: React.FC<{ frame: number; colors: string[] }> = ({
  frame,
  colors,
}) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 5 + Math.random() * 15,
      speed: 0.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 60,
    }));
  }, [colors]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {particles.map((p) => {
        const y = ((p.y - ((frame - p.delay) * p.speed * 0.5)) % 120) - 10;
        const opacity = interpolate(y, [-10, 0, 100, 110], [0, 0.6, 0.6, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity,
              transform: `rotate(${frame * p.speed}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const DecoElements: React.FC<{
  style: string;
  frame: number;
  fps: number;
  theme: Theme;
}> = ({ style, frame, fps, theme }) => {
  if (style === 'elegant-fade' || style === 'cinematic') {
    // Decorative lines
    const lineOpacity = interpolate(frame, [0, fps], [0, 0.3], {
      extrapolateRight: 'clamp',
    });

    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '30%',
            height: 1,
            backgroundColor: '#FFFFFF',
            opacity: lineOpacity,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '30%',
            height: 1,
            backgroundColor: '#FFFFFF',
            opacity: lineOpacity,
          }}
        />
      </>
    );
  }

  return null;
};

export default TitleSlide;
