export type TrackType = 'photo' | 'audio' | 'narration' | 'subtitle' | 'overlay';

export interface TimelineData {
  tracks: Track[];
  totalDuration: number;
  currentTime: number;
  zoom: number;
}

export interface Track {
  id: string;
  type: TrackType;
  name?: string;
  clips: Clip[];
  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
  volume?: number;
}

export interface Clip {
  id: string;
  startTime: number;
  endTime: number;
  resourceId: string;
  properties: ClipProperties;
}

export interface ClipProperties {
  // Photo properties
  effect?: string;
  transition?: string;
  transitionDuration?: number;
  kenBurns?: {
    startScale: number;
    endScale: number;
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
  };
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: number;
    sepia?: number;
  };

  // Audio properties
  url?: string;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
  startOffset?: number;

  // Text/Subtitle properties
  text?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    backgroundColor?: string;
    position?: { x: number; y: number };
    animation?: string;
  };
}

export interface TimelineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  snapToGrid: boolean;
  gridSize: number;
}

export interface TimelineAction {
  type: 'add' | 'remove' | 'move' | 'resize' | 'split' | 'merge' | 'update';
  clipId?: string;
  trackId?: string;
  data?: Partial<Clip>;
  previousState?: Clip;
}
