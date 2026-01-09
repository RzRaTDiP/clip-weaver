export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  file: File;
  duration?: number;
  thumbnail?: string;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  type: 'video' | 'audio' | 'image' | 'text';
  name: string;
  startTime: number;
  duration: number;
  trackIndex: number;
  url?: string;
  thumbnail?: string;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  clips: TimelineClip[];
}

export interface EditorState {
  mediaItems: MediaItem[];
  tracks: Track[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number;
}
