import { useState, useCallback, useRef, useEffect } from 'react';
import { MediaItem, Track, TimelineClip, EditorState } from '@/types/editor';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useVideoEditor = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [tracks, setTracks] = useState<Track[]>([
    { id: 'text-track', type: 'text', name: 'Text', clips: [] },
    { id: 'video-track', type: 'video', name: 'Video', clips: [] },
    { id: 'audio-track', type: 'audio', name: 'Audio', clips: [] },
  ]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [draggedMedia, setDraggedMedia] = useState<MediaItem | null>(null);

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const duration = Math.max(
    ...tracks.flatMap(t => t.clips.map(c => c.startTime + c.duration)),
    60
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        
        setCurrentTime(prev => {
          const newTime = prev + delta;
          if (newTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);

  const addMedia = useCallback(async (files: FileList) => {
    const newItems: MediaItem[] = [];
    
    for (const file of Array.from(files)) {
      const type = file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('image/')
        ? 'image'
        : null;
        
      if (!type) continue;
      
      const url = URL.createObjectURL(file);
      let duration: number | undefined;
      let thumbnail: string | undefined;
      
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = url;
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            duration = video.duration;
            // Create thumbnail
            video.currentTime = 0;
            video.onseeked = () => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(video, 0, 0);
              thumbnail = canvas.toDataURL('image/jpeg', 0.5);
              resolve();
            };
          };
        });
      } else if (type === 'audio') {
        const audio = document.createElement('audio');
        audio.src = url;
        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => {
            duration = audio.duration;
            resolve();
          };
        });
      } else if (type === 'image') {
        duration = 5; // Default 5 seconds for images
        thumbnail = url;
      }
      
      newItems.push({
        id: generateId(),
        name: file.name,
        type,
        url,
        file,
        duration,
        thumbnail,
      });
    }
    
    setMediaItems(prev => [...prev, ...newItems]);
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setMediaItems(prev => {
      const item = prev.find(m => m.id === id);
      if (item) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const addClipToTimeline = useCallback((media: MediaItem, trackType: 'video' | 'audio', startTime: number) => {
    const clip: TimelineClip = {
      id: generateId(),
      mediaId: media.id,
      type: media.type === 'image' ? 'video' : media.type,
      name: media.name,
      startTime,
      duration: media.duration || 5,
      trackIndex: trackType === 'video' ? 1 : 2,
      url: media.url,
      thumbnail: media.thumbnail,
    };
    
    setTracks(prev => prev.map(track => {
      if (track.type === trackType || (trackType === 'video' && media.type === 'image' && track.type === 'video')) {
        return { ...track, clips: [...track.clips, clip] };
      }
      return track;
    }));
  }, []);

  const moveClip = useCallback((clipId: string, newStartTime: number, newTrackIndex: number) => {
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? { ...clip, startTime: Math.max(0, newStartTime) }
          : clip
      ),
    })));
  }, []);

  const deleteClip = useCallback((clipId: string) => {
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.filter(clip => clip.id !== clipId),
    })));
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  return {
    mediaItems,
    tracks,
    currentTime,
    isPlaying,
    duration,
    zoom,
    draggedMedia,
    addMedia,
    deleteMedia,
    addClipToTimeline,
    moveClip,
    deleteClip,
    togglePlayPause,
    seek,
    setZoom,
    setDraggedMedia,
  };
};
