import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionType } from '@/types/transition';

interface TransitionWrapperProps {
  type: TransitionType;
  durationInFrames: number;
  direction: 'in' | 'out';
  children: React.ReactNode;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  type,
  durationInFrames,
  direction,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalFrames } = useVideoConfig();

  const getTransitionStyles = (): React.CSSProperties => {
    const isIn = direction === 'in';
    const transitionFrame = isIn ? frame : totalFrames - frame;
    const progress = Math.min(1, transitionFrame / durationInFrames);

    switch (type) {
      case 'none':
        return {};

      case 'fade':
        return {
          opacity: isIn
            ? interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0, 1], [1, 0], { extrapolateRight: 'clamp' }),
        };

      case 'crossDissolve':
        return {
          opacity: isIn
            ? interpolate(progress, [0, 1], [0, 1], {
                extrapolateRight: 'clamp',
                easing: Easing.inOut(Easing.ease),
              })
            : 1,
        };

      case 'slideLeft':
        return {
          transform: isIn
            ? `translateX(${interpolate(progress, [0, 1], [100, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}%)`
            : `translateX(${interpolate(progress, [0, 1], [0, -100], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}%)`,
        };

      case 'slideRight':
        return {
          transform: isIn
            ? `translateX(${interpolate(progress, [0, 1], [-100, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}%)`
            : `translateX(${interpolate(progress, [0, 1], [0, 100], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}%)`,
        };

      case 'slideUp':
        return {
          transform: isIn
            ? `translateY(${interpolate(progress, [0, 1], [100, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}%)`
            : `translateY(${interpolate(progress, [0, 1], [0, -100], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}%)`,
        };

      case 'slideDown':
        return {
          transform: isIn
            ? `translateY(${interpolate(progress, [0, 1], [-100, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}%)`
            : `translateY(${interpolate(progress, [0, 1], [0, 100], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}%)`,
        };

      case 'zoomIn':
        return {
          transform: isIn
            ? `scale(${interpolate(progress, [0, 1], [0.5, 1], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })})`
            : `scale(${interpolate(progress, [0, 1], [1, 1.5], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })})`,
          opacity: isIn
            ? interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0.5, 1], [1, 0], { extrapolateLeft: 'clamp' }),
        };

      case 'zoomOut':
        return {
          transform: isIn
            ? `scale(${interpolate(progress, [0, 1], [1.5, 1], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })})`
            : `scale(${interpolate(progress, [0, 1], [1, 0.5], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })})`,
          opacity: isIn
            ? interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0.5, 1], [1, 0], { extrapolateLeft: 'clamp' }),
        };

      case 'spin':
        return {
          transform: isIn
            ? `rotate(${interpolate(progress, [0, 1], [-180, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}deg) scale(${interpolate(progress, [0, 1], [0, 1], {
                extrapolateRight: 'clamp',
              })})`
            : `rotate(${interpolate(progress, [0, 1], [0, 180], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}deg) scale(${interpolate(progress, [0, 1], [1, 0], {
                extrapolateRight: 'clamp',
              })})`,
          opacity: isIn
            ? interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0.7, 1], [1, 0], { extrapolateLeft: 'clamp' }),
        };

      case 'spinZoom':
        return {
          transform: isIn
            ? `rotate(${interpolate(progress, [0, 1], [360, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}deg) scale(${interpolate(progress, [0, 1], [0, 1], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.back(1.5)),
              })})`
            : undefined,
          opacity: isIn ? interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' }) : 1,
        };

      case 'flipHorizontal':
        return {
          transform: isIn
            ? `perspective(1000px) rotateY(${interpolate(progress, [0, 1], [90, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}deg)`
            : `perspective(1000px) rotateY(${interpolate(progress, [0, 1], [0, -90], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}deg)`,
          opacity: isIn
            ? interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp' }),
        };

      case 'flipVertical':
        return {
          transform: isIn
            ? `perspective(1000px) rotateX(${interpolate(progress, [0, 1], [-90, 0], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              })}deg)`
            : `perspective(1000px) rotateX(${interpolate(progress, [0, 1], [0, 90], {
                extrapolateRight: 'clamp',
                easing: Easing.in(Easing.cubic),
              })}deg)`,
          opacity: isIn
            ? interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp' }),
        };

      case 'wipe':
        const wipeProgress = isIn ? progress : 1 - progress;
        return {
          clipPath: `inset(0 ${(1 - wipeProgress) * 100}% 0 0)`,
        };

      case 'circleWipe':
        const circleProgress = isIn ? progress : 1 - progress;
        const radius = circleProgress * 150;
        return {
          clipPath: `circle(${radius}% at 50% 50%)`,
        };

      case 'diamondWipe':
        const diamondProgress = isIn ? progress : 1 - progress;
        const size = diamondProgress * 150;
        return {
          clipPath: `polygon(50% ${50 - size}%, ${50 + size}% 50%, 50% ${50 + size}%, ${50 - size}% 50%)`,
        };

      case 'heartWipe':
        const heartProgress = isIn ? progress : 1 - progress;
        const heartScale = heartProgress * 2;
        return {
          clipPath: `path("M 50 ${100 - heartScale * 30} C ${50 - heartScale * 25} ${100 - heartScale * 50}, ${50 - heartScale * 50} ${100 - heartScale * 30}, 50 100 C ${50 + heartScale * 50} ${100 - heartScale * 30}, ${50 + heartScale * 25} ${100 - heartScale * 50}, 50 ${100 - heartScale * 30}")`,
          opacity: heartProgress,
        };

      case 'starWipe':
        const starProgress = isIn ? progress : 1 - progress;
        const starScale = starProgress * 150;
        // 5-pointed star
        return {
          clipPath: `polygon(50% ${50 - starScale}%, ${50 + starScale * 0.22}% ${50 - starScale * 0.31}%, ${50 + starScale}% ${50 - starScale * 0.31}%, ${50 + starScale * 0.36}% ${50 + starScale * 0.12}%, ${50 + starScale * 0.59}% ${50 + starScale}%, 50% ${50 + starScale * 0.38}%, ${50 - starScale * 0.59}% ${50 + starScale}%, ${50 - starScale * 0.36}% ${50 + starScale * 0.12}%, ${50 - starScale}% ${50 - starScale * 0.31}%, ${50 - starScale * 0.22}% ${50 - starScale * 0.31}%)`,
        };

      case 'glitch':
        const glitchProgress = isIn ? progress : 1 - progress;
        const glitchOffset = Math.sin(progress * Math.PI * 10) * (1 - progress) * 20;
        return {
          transform: `translateX(${glitchOffset}px)`,
          opacity: glitchProgress,
          filter: `hue-rotate(${(1 - progress) * 90}deg)`,
        };

      case 'pixelate':
        // Pixelate effect using scale and image-rendering
        const pixelProgress = isIn ? progress : 1 - progress;
        const pixelSize = interpolate(pixelProgress, [0, 1], [0.1, 1]);
        return {
          transform: `scale(${1 / pixelSize})`,
          filter: `blur(${(1 - pixelProgress) * 5}px)`,
          opacity: pixelProgress,
        };

      case 'blur':
        const blurProgress = isIn ? progress : 1 - progress;
        return {
          filter: `blur(${(1 - blurProgress) * 20}px)`,
          opacity: blurProgress,
        };

      case 'ripple':
        const rippleProgress = isIn ? progress : 1 - progress;
        return {
          transform: `scale(${0.9 + rippleProgress * 0.1})`,
          opacity: rippleProgress,
          filter: `blur(${(1 - rippleProgress) * 5}px)`,
        };

      case 'lightLeak':
        return {
          opacity: isIn
            ? interpolate(progress, [0, 0.5, 1], [0, 1.2, 1], { extrapolateRight: 'clamp' })
            : interpolate(progress, [0, 0.5, 1], [1, 1.2, 0], { extrapolateRight: 'clamp' }),
          filter: isIn
            ? `brightness(${interpolate(progress, [0, 0.5, 1], [1, 1.5, 1])})`
            : `brightness(${interpolate(progress, [0, 0.5, 1], [1, 1.5, 1])})`,
        };

      case 'dissolveParticles':
        const dissolveProgress = isIn ? progress : 1 - progress;
        return {
          opacity: dissolveProgress,
          filter: `contrast(${1 + (1 - dissolveProgress) * 0.5}) brightness(${1 + (1 - dissolveProgress) * 0.3})`,
        };

      case 'morph':
        const morphProgress = isIn ? progress : 1 - progress;
        return {
          transform: `scale(${0.95 + morphProgress * 0.05}) skewX(${(1 - morphProgress) * 5}deg)`,
          opacity: morphProgress,
          borderRadius: `${(1 - morphProgress) * 50}%`,
        };

      default:
        return {
          opacity: interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
        };
    }
  };

  const styles = getTransitionStyles();

  return (
    <AbsoluteFill
      style={{
        ...styles,
        overflow: 'hidden',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export default TransitionWrapper;
