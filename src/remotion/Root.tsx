import React from 'react';
import { Composition } from 'remotion';
import { PhotoStory } from './compositions/PhotoStory';
import { Project } from '@/types/project';
import { Theme } from '@/types/theme';

const PhotoStoryWrapper = PhotoStory as React.FC<{ project: Project; theme: Theme }>;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PhotoStory"
      component={PhotoStoryWrapper}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        project: {} as Project,
        theme: {} as Theme,
      }}
    />
  );
};
