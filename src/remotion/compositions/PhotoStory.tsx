import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { PhotoSlide } from './PhotoSlide';
import { TitleSlide } from './TitleSlide';
import { EndingSlide } from './EndingSlide';
import { SubtitleOverlay } from './SubtitleOverlay';
import { TransitionWrapper } from '../transitions';
import { Project, IntroConfig, OutroConfig } from '@/types/project';
import { Theme } from '@/types/theme';
import { Subtitle } from '@/types/effect';

interface PhotoStoryProps {
  project: Project;
  theme: Theme;
}

export const PhotoStory: React.FC<PhotoStoryProps> = ({ project, theme }) => {
  const { fps, durationInFrames } = useVideoConfig();

  const { photos, timeline, audio, narration, subtitles, introConfig, outroConfig } = project;

  const introFrames = Math.floor((introConfig?.duration || 5) * fps);
  const outroFrames = Math.floor((outroConfig?.duration || 5) * fps);

  // Calculate photo timing
  const photoTrack = timeline?.tracks.find((t) => t.type === 'photo');

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      {/* Intro/Title Slide */}
      <Sequence from={0} durationInFrames={introFrames}>
        <TitleSlide
          title={introConfig?.title || project.title}
          subtitle={introConfig?.subtitle}
          date={introConfig?.date}
          theme={theme}
          style={introConfig?.style || theme.introStyles[0]?.type || 'fade-zoom'}
          aiContent={introConfig?.generatedContent}
        />
      </Sequence>

      {/* Photo Slides with Transitions */}
      {photoTrack?.clips.map((clip, index) => {
        const photo = photos.find((p) => p.id === clip.resourceId);
        if (!photo) return null;

        const startFrame = Math.floor(clip.startTime * fps);
        const duration = Math.floor((clip.endTime - clip.startTime) * fps);
        const nextClip = photoTrack.clips[index + 1];
        const transition = clip.properties.transition || theme.defaultTransition;
        const transitionDuration = clip.properties.transitionDuration || 1000;
        const transitionFrames = Math.floor((transitionDuration / 1000) * fps);

        return (
          <React.Fragment key={clip.id}>
            <Sequence from={startFrame} durationInFrames={duration}>
              <TransitionWrapper
                type={transition as any}
                durationInFrames={transitionFrames}
                direction="in"
              >
                <PhotoSlide
                  photo={photo}
                  effect={clip.properties.effect || theme.defaultEffect}
                  kenBurns={clip.properties.kenBurns}
                  theme={theme}
                  filters={clip.properties.filters}
                />
              </TransitionWrapper>
            </Sequence>
          </React.Fragment>
        );
      })}

      {/* Outro/Ending Slide */}
      <Sequence
        from={durationInFrames - outroFrames}
        durationInFrames={outroFrames}
      >
        <EndingSlide
          message={outroConfig?.message || theme.defaultEnding}
          theme={theme}
          style={outroConfig?.style || theme.outroStyles[0]?.type || 'fade-out'}
          showPhotos={outroConfig?.showPhotos ?? true}
          photos={photos.slice(0, 6)}
          credits={outroConfig?.credits}
          aiContent={outroConfig?.generatedContent}
        />
      </Sequence>

      {/* Background Music */}
      {audio?.backgroundMusic && (
        <Audio
          src={audio.backgroundMusic.url}
          volume={(f) => {
            const fadeInFrames = Math.floor(
              (audio.backgroundMusic!.fadeIn / 1000) * fps
            );
            const fadeOutFrames = Math.floor(
              (audio.backgroundMusic!.fadeOut / 1000) * fps
            );
            const baseVolume = audio.backgroundMusic!.volume;

            if (f < fadeInFrames) {
              return interpolate(f, [0, fadeInFrames], [0, baseVolume], {
                easing: Easing.ease,
              });
            }
            if (f > durationInFrames - fadeOutFrames) {
              return interpolate(
                f,
                [durationInFrames - fadeOutFrames, durationInFrames],
                [baseVolume, 0],
                { easing: Easing.ease }
              );
            }
            return baseVolume;
          }}
          startFrom={Math.floor((audio.backgroundMusic.startOffset || 0) * fps)}
          loop={audio.backgroundMusic.loop}
        />
      )}

      {/* Narration Audio */}
      {narration?.audioUrl && (
        <Audio src={narration.audioUrl} volume={0.9} />
      )}

      {/* Subtitles */}
      {subtitles?.map((subtitle: Subtitle) => (
        <Sequence
          key={subtitle.id}
          from={Math.floor(subtitle.startTime * fps)}
          durationInFrames={Math.floor(
            (subtitle.endTime - subtitle.startTime) * fps
          )}
        >
          <SubtitleOverlay text={subtitle.text} style={subtitle.style} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default PhotoStory;
