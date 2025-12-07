import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Photo {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  order: number;
  aiAnalysis?: any;
}

interface Clip {
  id: string;
  type: 'intro' | 'photo' | 'outro';
  startFrame: number;
  durationInFrames: number;
  thumbnailUrl?: string;
  transitionIn?: string;
  transitionOut?: string;
  effects?: string[];
}

interface AudioClip {
  id: string;
  type: 'music' | 'narration';
  startFrame: number;
  durationInFrames: number;
  volume: number;
  url: string;
  name?: string;
}

interface ProjectState {
  // Project data
  project: {
    id: string | null;
    name: string;
    themeId: string;
    settings: {
      aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
      fps: number;
      resolution: '720p' | '1080p' | '4k';
    };
  };
  photos: Photo[];
  clips: Clip[];
  audioClips: AudioClip[];
  introConfig: any;
  outroConfig: any;
  narration: any;

  // Editor state
  currentFrame: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  zoom: number;

  // UI state
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  activePanel: string;

  // Actions
  setProject: (project: Partial<ProjectState['project']>) => void;
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (startIndex: number, endIndex: number) => void;
  setClips: (clips: Clip[]) => void;
  addClip: (clip: Clip) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  removeClip: (id: string) => void;
  setAudioClips: (clips: AudioClip[]) => void;
  addAudioClip: (clip: AudioClip) => void;
  removeAudioClip: (id: string) => void;
  setIntroConfig: (config: any) => void;
  setOutroConfig: (config: any) => void;
  setNarration: (narration: any) => void;
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSelectedClipId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setActivePanel: (panel: string) => void;
  setSaving: (isSaving: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  reset: () => void;
}

const initialState = {
  project: {
    id: null,
    name: '새 프로젝트',
    themeId: 'elegant-fade',
    settings: {
      aspectRatio: '16:9' as const,
      fps: 30,
      resolution: '1080p' as const,
    },
  },
  photos: [],
  clips: [],
  audioClips: [],
  introConfig: null,
  outroConfig: null,
  narration: null,
  currentFrame: 0,
  isPlaying: false,
  selectedClipId: null,
  zoom: 1,
  isSaving: false,
  hasUnsavedChanges: false,
  activePanel: 'layers',
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setProject: (project) =>
          set((state) => ({
            project: { ...state.project, ...project },
            hasUnsavedChanges: true,
          })),

        setPhotos: (photos) =>
          set(() => ({
            photos,
            hasUnsavedChanges: true,
          })),

        addPhoto: (photo) =>
          set((state) => ({
            photos: [...state.photos, photo],
            hasUnsavedChanges: true,
          })),

        removePhoto: (id) =>
          set((state) => ({
            photos: state.photos.filter((p) => p.id !== id),
            hasUnsavedChanges: true,
          })),

        reorderPhotos: (startIndex, endIndex) =>
          set((state) => {
            const result = Array.from(state.photos);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return {
              photos: result.map((p, i) => ({ ...p, order: i })),
              hasUnsavedChanges: true,
            };
          }),

        setClips: (clips) => set(() => ({ clips, hasUnsavedChanges: true })),

        addClip: (clip) =>
          set((state) => ({
            clips: [...state.clips, clip],
            hasUnsavedChanges: true,
          })),

        updateClip: (id, updates) =>
          set((state) => ({
            clips: state.clips.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            hasUnsavedChanges: true,
          })),

        removeClip: (id) =>
          set((state) => ({
            clips: state.clips.filter((c) => c.id !== id),
            hasUnsavedChanges: true,
          })),

        setAudioClips: (clips) =>
          set(() => ({ audioClips: clips, hasUnsavedChanges: true })),

        addAudioClip: (clip) =>
          set((state) => ({
            audioClips: [...state.audioClips, clip],
            hasUnsavedChanges: true,
          })),

        removeAudioClip: (id) =>
          set((state) => ({
            audioClips: state.audioClips.filter((a) => a.id !== id),
            hasUnsavedChanges: true,
          })),

        setIntroConfig: (config) =>
          set(() => ({ introConfig: config, hasUnsavedChanges: true })),

        setOutroConfig: (config) =>
          set(() => ({ outroConfig: config, hasUnsavedChanges: true })),

        setNarration: (narration) =>
          set(() => ({ narration, hasUnsavedChanges: true })),

        setCurrentFrame: (frame) => set(() => ({ currentFrame: frame })),

        setIsPlaying: (isPlaying) => set(() => ({ isPlaying })),

        setSelectedClipId: (id) => set(() => ({ selectedClipId: id })),

        setZoom: (zoom) => set(() => ({ zoom })),

        setActivePanel: (panel) => set(() => ({ activePanel: panel })),

        setSaving: (isSaving) => set(() => ({ isSaving })),

        setHasUnsavedChanges: (hasChanges) =>
          set(() => ({ hasUnsavedChanges: hasChanges })),

        reset: () => set(() => initialState),
      }),
      {
        name: 'photostory-project',
        partialize: (state) => ({
          project: state.project,
          activePanel: state.activePanel,
          zoom: state.zoom,
        }),
      }
    )
  )
);

export default useProjectStore;
