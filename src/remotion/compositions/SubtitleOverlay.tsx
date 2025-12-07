import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { SubtitleStyle } from '@/types/effect';

interface SubtitleOverlayProps {
  text: string;
  style: SubtitleStyle;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  text,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeInDuration = fps * 0.3;
  const fadeOutStart = durationInFrames - fps * 0.3;

  const getAnimationStyles = () => {
    switch (style.animation) {
      case 'fade':
        return {
          opacity: interpolate(
            frame,
            [0, fadeInDuration, fadeOutStart, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
          transform: 'none',
        };

      case 'slide':
        const slideProgress = interpolate(
          frame,
          [0, fadeInDuration],
          [0, 1],
          { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        );
        const slideOutProgress = interpolate(
          frame,
          [fadeOutStart, durationInFrames],
          [0, 1],
          { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
        );
        return {
          opacity: interpolate(
            frame,
            [0, fadeInDuration, fadeOutStart, durationInFrames],
            [0, 1, 1, 0]
          ),
          transform: `translateY(${interpolate(slideProgress, [0, 1], [20, 0]) + interpolate(slideOutProgress, [0, 1], [0, -20])}px)`,
        };

      case 'typewriter':
        const revealProgress = interpolate(
          frame,
          [0, durationInFrames * 0.3],
          [0, 1],
          { extrapolateRight: 'clamp' }
        );
        const charCount = Math.floor(revealProgress * text.length);
        return {
          opacity: 1,
          clipPath: `inset(0 ${100 - (charCount / text.length) * 100}% 0 0)`,
        };

      case 'bounce':
        const bounceOpacity = interpolate(
          frame,
          [0, fadeInDuration, fadeOutStart, durationInFrames],
          [0, 1, 1, 0]
        );
        const bounceY = interpolate(
          frame,
          [0, fadeInDuration * 0.5, fadeInDuration],
          [30, -5, 0],
          { extrapolateRight: 'clamp', easing: Easing.out(Easing.bounce) }
        );
        return {
          opacity: bounceOpacity,
          transform: `translateY(${bounceY}px)`,
        };

      default:
        return {
          opacity: interpolate(
            frame,
            [0, fadeInDuration, fadeOutStart, durationInFrames],
            [0, 1, 1, 0]
          ),
          transform: 'none',
        };
    }
  };

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  switch (style.position) {
    case 'top':
      positionStyles.top = '10%';
      break;
    case 'center':
      positionStyles.top = '50%';
      positionStyles.transform = 'translate(-50%, -50%)';
      break;
    case 'bottom':
    default:
      positionStyles.bottom = '10%';
      break;
  }

  const animationStyles = getAnimationStyles();

  const textShadowStyle = style.shadow
    ? `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`
    : '0 2px 4px rgba(0,0,0,0.5)';

  const outlineStyle = style.outline
    ? `-1px -1px 0 ${style.outline.color}, 1px -1px 0 ${style.outline.color}, -1px 1px 0 ${style.outline.color}, 1px 1px 0 ${style.outline.color}`
    : undefined;

  return (
    <AbsoluteFill>
      <div
        style={{
          ...positionStyles,
          ...animationStyles,
          fontFamily: style.fontFamily || 'Pretendard',
          fontSize: style.fontSize || 32,
          fontWeight: style.fontWeight || 600,
          color: style.color || '#FFFFFF',
          backgroundColor: style.backgroundColor || 'rgba(0,0,0,0.6)',
          padding: '12px 24px',
          borderRadius: 8,
          textAlign: style.alignment || 'center',
          textShadow: outlineStyle || textShadowStyle,
          maxWidth: '80%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export default SubtitleOverlay;
